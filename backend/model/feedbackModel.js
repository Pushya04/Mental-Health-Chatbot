const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  chat: { type: mongoose.Schema.Types.ObjectId, ref: 'chats', required: true },
  turnIndex: { type: Number, default: 0 },   // which Q/A turn user rated
  stars: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Feedback', feedbackSchema);
