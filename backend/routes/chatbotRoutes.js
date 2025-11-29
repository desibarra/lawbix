const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');
const { protect } = require('../middlewares/authMiddleware');

// All chatbot routes require authentication
router.use(protect);

// Send message to chatbot
router.post('/', chatbotController.sendMessage);

// Get chat history
router.get('/history', chatbotController.getChatHistory);

// Clear chat history
router.delete('/history', chatbotController.clearHistory);

module.exports = router;
