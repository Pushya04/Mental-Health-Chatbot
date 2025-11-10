// ============================================================
// 🧠 EmpaTalk Backend (MERN + Local NLP Integration)
// ============================================================
const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');

// 1) Initialize App
const app = express();
const PORT = 5001;

// 2) Middleware
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// 3) Serve local static model assets if needed
app.use('/tfjs_model', express.static(path.join(__dirname, 'tfjs_model')));

// 4) Health check routes
app.get('/', (req, res) => res.send('🧠 EmpaTalk Backend is Running!'));
app.get('/api/ping', (req, res) => res.json({ ok: true }));

// 5) Routes (your existing)
app.use('/chat', require('./routes/chatRoutes'));
app.use('/user', require('./routes/userRoutes'));
app.use('/feedback', require('./routes/feedbackRoutes'));

// 6) Python FastAPI integration route (connects to model service at :8008)
app.use('/api', require('./routes/chat'));

// 7) MongoDB (your fixed connection string)
const DB_URL = "mongodb+srv://chatbot_user:Bantu123@chatbot.itvziai.mongodb.net/chatbot?retryWrites=true&w=majority&appName=chatbot";

console.log('🔄 Attempting to connect to MongoDB...');
mongoose.connect(DB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('✅ MongoDB Connected Successfully!');
    try {
      const collections = await mongoose.connection.db.listCollections().toArray();
      console.log('📚 Available Collections:', collections.map(c => c.name));
    } catch {
      console.warn('⚠️ Could not list collections (no permissions).');
    }

    // Start backend server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`💬 Connected to FastAPI model at http://127.0.0.1:8008`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB Connection Error:', err.message);
    app.listen(PORT, () => console.log(`🚀 Server started (no DB) on http://localhost:${PORT}`));
  });

// 8) Error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack || err);
  res.status(500).json({ message: err.message || 'Internal Server Error' });
});
