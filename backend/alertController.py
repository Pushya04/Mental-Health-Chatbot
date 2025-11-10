import os
import json
import numpy as np
import tensorflow as tf
from tensorflow.keras.preprocessing.sequence import pad_sequences
from tensorflow.keras.models import load_model

# ======================
# 1. Load Local Models
# ======================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "tfjs_model")

# Load suicide detection model (already TFJS-compatible)
SUICIDE_MODEL_PATH = os.path.join(MODEL_DIR, "model.h5")  # or 'model.json' if TFJS
TOKENIZER_PATH = os.path.join(MODEL_DIR, "tokenizer_word_index.json")
EMOTION_MODEL_PATH = os.path.join(MODEL_DIR, "emotion_model.h5")

# Load tokenizer index
with open(TOKENIZER_PATH, "r", encoding="utf-8") as f:
    word_index = json.load(f)

# Reverse tokenizer mapping
word2idx = {w: int(i) for w, i in word_index.items()}

# Load models
suicide_model = load_model(SUICIDE_MODEL_PATH)
emotion_model = load_model(EMOTION_MODEL_PATH)

# ======================
# 2. Helper Functions
# ======================

MAX_LEN = 100

def preprocess_text(text):
    """Convert input text to padded sequence using local tokenizer."""
    tokens = [word2idx.get(w.lower(), 0) for w in text.split()]
    padded = pad_sequences([tokens], maxlen=MAX_LEN, padding='post', truncating='post')
    return padded

def detect_emotion(text):
    """Predict emotion using local model."""
    seq = preprocess_text(text)
    preds = emotion_model.predict(seq)[0]
    label_index = np.argmax(preds)
    emotions = ["happy", "sad", "angry", "fear", "neutral"]
    return emotions[label_index]

def detect_suicide_risk(text):
    """Predict suicide risk probability using local TFJS model."""
    seq = preprocess_text(text)
    preds = suicide_model.predict(seq)[0]
    prob_suicide = float(preds[-1])  # assuming last index = suicide prob
    return prob_suicide

# ======================
# 3. Main Entry Point
# ======================

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:
        input_text = " ".join(sys.argv[1:])
        emotion_label = detect_emotion(input_text)
        suicide_prob = detect_suicide_risk(input_text)
        print(json.dumps({
            "emotion": emotion_label,
            "suicide_prob": suicide_prob
        }))
    else:
        print(json.dumps({"emotion": "neutral", "suicide_prob": 0.0}))
