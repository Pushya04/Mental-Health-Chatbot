const chat = require('../model/chatModel');
const asyncHandler = require("express-async-handler");
const { safetyResponse, templates } = require('../utils/responseTemplates');
const { inferIntent } = require('../utils/intent');
const { suggest, getQuote } = require('../utils/recommender');
const { detectEmotionFlag, inferEmotionLabel } = require('../utils/emotion');

// Delete a chat by ID
exports.deleteChat = asyncHandler(async (req, res) => {
  try {
    const id = req.params.id;
    const deleted = await chat.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Chat not found' });
    }
    res.json({ message: 'Chat deleted successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});



// =======================================// =======================================

// 🔹 Create a New Chat// 🔹 Create a New Chat

// =======================================// =======================================


exports.createChat = asyncHandler(async (req, res) => {
  if (!req.user) {
    res.status(401);
    throw new Error('User not found');
  }
  let chatArray = req.body && Array.isArray(req.body.chat) && req.body.chat.length > 0
    ? req.body.chat
    : null;
  if (!chatArray) {
    // fallback to system message if nothing provided
    const welcome = `Hello ${req.user.name || 'friend'}, I am EmpaTalk. How can I help you today?`;
    chatArray = [{
      question: '__system__',
      answer: welcome,
      meta: { system: true },
      at: new Date()
    }];
  }
  const newChat = new chat({
    user: req.user.id,
    chat: chatArray
  });
  await newChat.save();
  return res.status(200).json(newChat);
});



// =======================================// =======================================

// 🔹 Get All Chats for a User// 🔹 Get All Chats for a User

// =======================================// =======================================


exports.getChatHistory = async (req, res) => {
  try {
    const chats = await chat.find({ user: req.user.id });
    res.json(chats);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};



// =======================================// =======================================

// 🔹 Get a Specific Chat by ID// 🔹 Get a Specific Chat by ID

// =======================================// =======================================


exports.getChat = async (req, res) => {
  try {
    const id = req.params.id;
    const cht1 = await chat.findById(id);
    if (!cht1) {
      return res.status(404).json({ message: 'Chat not found' });
    }
    res.json(cht1);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};





// =======================================// =======================================

// 🔹 Ask a Question → Predict → Respond// 🔹 Ask a Question → Predict → Respond

// =======================================// =======================================


exports.askQuestion = asyncHandler(async (req, res) => {
  const { question } = req.body;
  const id = req.params.id;
  const cht1 = await chat.findById(id);
  if (!cht1) return res.status(404).json({ message: 'Chat not found' });
  let answerText = '';

  // Intercept model identity questions and override response
  const identityPatterns = [
    /who (are|is) (you|empatalk|the agent)/i,
    /what (ai|model|agent|bot) (are|is) (this|you|empatalk)/i,
    /which ai model/i,
    /what is your name/i,
    /who created (you|empatalk|the agent|this)/i,
    /who made (you|empatalk|the agent|this)/i,
    /are you (alibaba|openai|gpt|chatgpt|cloud)/i,
    /what is alibaba cloud/i,
    /who owns you/i
  ];
  if (identityPatterns.some((pat) => pat.test(question))) {
    answerText = "I am EmpaTalk, an AI assistant created by Pushya and team for mental health support.";
    const turn = {
      question,
      answer: answerText,
      meta: { identityIntercept: true },
      at: new Date()
    };
    cht1.chat.push(turn);
    await cht1.save();
    return res.status(200).json(cht1);
  }

  // Always use the model (uvicorn) for generating answers
  const axios = require('axios');
  // Build history for the model
  const history = cht1.chat
    .filter(m => m.question && m.question !== '__system__' && m.answer)
    .map(m => [
      { role: 'user', content: m.question },
      { role: 'assistant', content: m.answer }
    ])
    .flat();
  // Add the current user question
  const modelHistory = [...history];
  // Send to model service
  try {
    const modelRes = await axios.post('http://127.0.0.1:8008/generate', {
      message: question,
      history: modelHistory
    }, { timeout: 90000 });
    answerText = modelRes.data?.text || 'Sorry, I could not generate a response.';
  } catch (err) {
    answerText = 'Sorry, the model service is unavailable.';
  }
  const turn = {
    question,
    answer: answerText,
    meta: {
      model: 'Qwen'
    },
    at: new Date()
  };
  cht1.chat.push(turn);
  await cht1.save();
  return res.status(200).json(cht1);
});


