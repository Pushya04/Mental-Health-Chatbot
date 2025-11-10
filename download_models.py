# ml_service/serve_model.py
import os
from typing import Optional, List, Dict

import torch
from fastapi import FastAPI
from pydantic import BaseModel
from transformers import AutoTokenizer, AutoModelForCausalLM

app = FastAPI(title="LocalChatModels", version="1.4")

# Pick ONE model path. Phi3 is slower on CPU; TinyLlama is much faster.
# If you downloaded TinyLlama to C:\models\TinyLlama, set that as default for speed.
DEFAULT_MODEL = os.getenv("MODEL_NAME", r"C:\models\Phi3").strip()

# Keep CPU predictable and avoid offload thrashing
torch.set_num_threads(max(1, os.cpu_count() // 2))

MAX_INPUT_TOKENS = int(os.getenv("MAX_INPUT_TOKENS", "2048"))

def _f(env: str, default: str) -> float:
    try:
        return float(os.getenv(env, default))
    except Exception:
        return float(default)

# Keep generation short for speed on CPU
GEN_DEFAULTS = dict(
    max_new_tokens=int(os.getenv("MAX_NEW_TOKENS", "32")),  # ⬅️ small & fast
    temperature=_f("CHAT_TEMP", "0.6"),
    top_p=_f("TOP_P", "0.9"),
    repetition_penalty=_f("REP_PEN", "1.05"),
    do_sample=True,
    use_cache=False,  # ⬅️ avoids Phi-3 seen_tokens bug
)

_CACHE: Dict[str, Dict] = {}

def load_model(path: str):
    if path in _CACHE:
        return _CACHE[path]["tok"], _CACHE[path]["model"]
    print(f"[LOAD] {path}")
    tok = AutoTokenizer.from_pretrained(path, use_fast=True)
    if tok.pad_token is None and tok.eos_token is not None:
        tok.pad_token = tok.eos_token
    if tok.eos_token_id is None and tok.pad_token_id is not None:
        tok.eos_token_id = tok.pad_token_id

    # 👉 Force pure CPU to avoid accelerate "offload to disk" slowness
    model = AutoModelForCausalLM.from_pretrained(
        path,
        torch_dtype=torch.float32,   # CPU
        device_map="cpu",            # force CPU, no offload
        low_cpu_mem_usage=True,
        trust_remote_code=True,
    )
    model.eval()

    # Safety knobs for Phi-3 on CPU
    try:
        if hasattr(model, "generation_config"):
            model.generation_config.use_cache = False
        if hasattr(model, "config"):
            model.config.use_cache = False
            model.config.attn_implementation = "eager"
    except Exception:
        pass

    _CACHE[path] = {"tok": tok, "model": model}
    return tok, model

class Turn(BaseModel):
    role: str
    content: str

class ChatIn(BaseModel):
    message: str
    history: Optional[List[Turn]] = None
    max_new_tokens: Optional[int] = None
    temperature: Optional[float] = None
    top_p: Optional[float] = None
    repetition_penalty: Optional[float] = None

SYSTEM = (
    "You are an empathetic, helpful assistant for mental-health support. "
    "Be clear, kind, non-judgmental, and avoid medical claims. "
    "If user indicates crisis, advise contacting local professional help."
)

def build_messages(msg: str, history: Optional[List[Turn]]):
    msgs = [{"role": "system", "content": SYSTEM}]
    if history:
        for t in history:
            r = (t.role or "").lower().strip()
            if r not in ("user", "assistant", "system"):
                r = "user" if r in ("human", "client") else "assistant"
            msgs.append({"role": r, "content": t.content})
    msgs.append({"role": "user", "content": msg})
    return msgs

def to_prompt(tok, messages):
    try:
        return tok.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
    except Exception:
        lines = [f"<s>[SYSTEM]: {messages[0]['content']}"]
        for m in messages[1:]:
            tag = "USER" if m["role"] == "user" else ("ASSISTANT" if m["role"] == "assistant" else "SYSTEM")
            lines.append(f"[{tag}]: {m['content']}")
        lines.append("[ASSISTANT]:")
        return "\n".join(lines)

@app.on_event("startup")
def _startup():
    # Preload & warm
    tok, model = load_model(DEFAULT_MODEL)
    try:
        prompt = to_prompt(tok, [{"role":"system","content":SYSTEM},{"role":"user","content":"hi"}])
        inputs = tok(prompt, return_tensors="pt", truncation=True, max_length=256).to("cpu")
        with torch.no_grad():
            _ = model.generate(**inputs, max_new_tokens=4, eos_token_id=tok.eos_token_id, use_cache=False)
        print("[WARM] generation done (CPU)")
    except Exception as e:
        print("[WARM] skipped:", e)

@app.get("/health")
def health():
    return {"ok": True, "default_model": DEFAULT_MODEL, "loaded": list(_CACHE.keys())}

@app.post("/generate")
def generate(inp: ChatIn):
    tok, model = load_model(DEFAULT_MODEL)
    prompt = to_prompt(tok, build_messages(inp.message, inp.history))
    inputs = tok(prompt, return_tensors="pt", truncation=True, max_length=MAX_INPUT_TOKENS).to("cpu")

    kw = GEN_DEFAULTS.copy()
    if inp.max_new_tokens is not None: kw["max_new_tokens"] = int(inp.max_new_tokens)
    if inp.temperature is not None:    kw["temperature"]     = float(inp.temperature)
    if inp.top_p is not None:          kw["top_p"]           = float(inp.top_p)
    if inp.repetition_penalty is not None:
        kw["repetition_penalty"] = float(inp.repetition_penalty)

    with torch.no_grad():
        out = model.generate(**inputs, eos_token_id=tok.eos_token_id, **kw)

    gen_ids = out[0][inputs["input_ids"].shape[1]:]
    text = tok.decode(gen_ids, skip_special_tokens=True).strip()
    return {"model": str(DEFAULT_MODEL), "text": text}
