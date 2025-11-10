const Feedback = require('../model/feedbackModel');

exports.submit = async (req, res) => {
  const { chat, turnIndex, stars, comment } = req.body;
  if (!chat || !stars) return res.status(400).json({ message: 'chat and stars required' });
  const fb = await Feedback.create({ user: req.user.id, chat, turnIndex: turnIndex || 0, stars, comment: comment || '' });
  res.status(201).json(fb);
};
