const express = require('express');
const { validate } = require('../middlewares/AuthMiddleware');
const { submit } = require('../controllers/feedbackController');
const router = express.Router();

router.post('/', validate, submit);
module.exports = router;
