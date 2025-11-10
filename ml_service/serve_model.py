# ml_service/serve_model.py
import os
from typing import Optional, List, Dict

import torch
from fastapi import FastAPI
from pydantic import BaseModel
from transformers import AutoTokenizer, AutoModelForCausalLM

app = FastAPI(title="LocalChatModels", version="1.2")

# ---- Use the smallest model you downloaded (CPU friendly)
DEFAULT_MODEL = os.getenv("MODEL_NAME", r"C:\models\Qwen0_5B")  

# Hard-force CPU (fastest + most stable on your machine)
os.environ["CUDA_VISIBLE_DEVICES"] = ""
DEVICE_MAP = {"": "cpu"}

# Keep generation short on CPU so it returns quickly
def _f(env, d):
    try:
        return float(os.getenv(env, d))
    except Exception:
        return float(d)

GEN = dict(
    max_new_tokens=int(os.getenv("MAX_NEW_TOKENS", "96")),   # keep small for latency
    temperature=_f("CHAT_TEMP", "0.7"),
    top_p=_f("TOP_P", "0.9"),
    repetition_penalty=_f("REP_PEN", "1.05"),
    do_sample=True,
)
MAX_INPUT_TOKENS = int(os.getenv("MAX_INPUT_TOKENS", "1024"))

# optional: control CPU threads (tune 2-6 for your CPU)
try:
    torch.set_num_threads(int(os.getenv("TORCH_NUM_THREADS", "4")))
except Exception:
    pass

_CACHE: Dict[str, Dict] = {}

def load_model(path: str):
    if path in _CACHE:
        return _CACHE[path]["tok"], _CACHE[path]["model"]

    print(f"[LOAD] {path} (CPU)")
    tok = AutoTokenizer.from_pretrained(path, use_fast=True, trust_remote_code=True)
    if tok.pad_token is None and tok.eos_token:
        tok.pad_token = tok.eos_token

    model = AutoModelForCausalLM.from_pretrained(
        path,
        torch_dtype=torch.float32,         
        device_map=DEVICE_MAP,
        low_cpu_mem_usage=True,
        trust_remote_code=True,
    )
    model.eval()
    _CACHE[path] = {"tok": tok, "model": model}
    return tok, model


# ---------- Schemas ----------
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
    "Be clear, kind, and avoid medical claims. Suggest seeking professional help in crises."
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
        # Simple fallback prompt format
        lines = [f"<s>[SYSTEM]: {messages[0]['content']}"]
        for m in messages[1:]:
            tag = "USER" if m["role"] == "user" else ("ASSISTANT" if m["role"] == "assistant" else "SYSTEM")
            lines.append(f"[{tag}]: {m['content']}")
        lines.append("[ASSISTANT]:")
        return "\n".join(lines)

@app.get("/health")
def health():
    return {"ok": True, "default_model": DEFAULT_MODEL, "loaded": list(_CACHE.keys())}

@app.post("/generate")
def generate(inp: ChatIn):
    identity_patterns = [
        r"who (are|is) (you|empatalk|the agent)",
        r"what (ai|model|agent|bot) (are|is) (this|you|empatalk)",
        r"which ai model",
        r"what is your name",
        r"who created (you|empatalk|the agent|this)",
        r"who made (you|empatalk|the agent|this)",
        r"are you (alibaba|openai|gpt|chatgpt|cloud)",
        r"what is alibaba cloud",
        r"who owns you"
    ]
    import re
    q = inp.message.strip().lower()
    if any(re.search(pat, q) for pat in identity_patterns):
        return {"model": str(DEFAULT_MODEL), "text": "I am EmpaTalk, an AI assistant created by Pushya and team for mental health support."}

    tok, model = load_model(DEFAULT_MODEL)
    prompt = to_prompt(tok, build_messages(inp.message, inp.history))
    inputs = tok(prompt, return_tensors="pt", truncation=True, max_length=MAX_INPUT_TOKENS).to("cpu")

    kw = GEN.copy()
    if inp.max_new_tokens is not None: kw["max_new_tokens"] = int(inp.max_new_tokens)
    if inp.temperature is not None: kw["temperature"] = float(inp.temperature)
    if inp.top_p is not None: kw["top_p"] = float(inp.top_p)
    if inp.repetition_penalty is not None: kw["repetition_penalty"] = float(inp.repetition_penalty)

    with torch.no_grad():
        out = model.generate(**inputs, eos_token_id=tok.eos_token_id, **kw)

    gen_ids = out[0][inputs["input_ids"].shape[1]:]
    text = tok.decode(gen_ids, skip_special_tokens=True).strip()
    return {"model": str(DEFAULT_MODEL), "text": text}
