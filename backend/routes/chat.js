// server/routes/chat.js
const express = require("express");
const axios = require("axios");
const router = express.Router();

const MODEL_URL = process.env.MODEL_URL || "http://127.0.0.1:8008";
const MODEL_TIMEOUT_MS = parseInt(process.env.MODEL_TIMEOUT_MS || "90000", 10); // 90s

const model = axios.create({
  baseURL: MODEL_URL,
  timeout: MODEL_TIMEOUT_MS,
  headers: { "Content-Type": "application/json" },
});

// POST /api/chat  { message: "..." , history?: [...] }
router.post("/chat", async (req, res) => {
  try {
    const { message, history } = req.body || {};
    if (typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ error: "message (string) is required" });
    }

    // Only send message and history as expected by FastAPI
    const payload = { message };
    if (Array.isArray(history) && history.length > 0) {
      payload.history = history.map(t => ({ role: t.role, content: t.content }));
    }

    // Debug: log payload
    console.log("Proxying to model:", JSON.stringify(payload));

    const r = await model.post("/generate", payload);
    return res.json({ reply: r.data?.text || "", model: r.data?.model || "local" });
  } catch (err) {
    const status = err.response?.status || 502;
    const detail = err.response?.data || err.message || "proxy error";
    console.error("[/api/chat] proxy error:", detail);
    return res.status(status).json({ error: "Model service unavailable", detail });
  }
});

// health proxy
router.get("/ping", async (_req, res) => {
  try {
    const r = await model.get("/health");
    res.json({ ok: true, model: r.data });
  } catch {
    res.status(503).json({ ok: false });
  }
});

module.exports = router;
