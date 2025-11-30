import express from 'express';
const router = express.Router();
import * as chatbotController from '../controllers/chatbotController.js';
import { protect } from '../middlewares/authMiddleware.js';

// All chatbot routes require authentication
router.use(protect);

// Send message to chatbot
router.post('/', chatbotController.sendMessage);

// Get chat history
router.get('/history', chatbotController.getChatHistory);

// Clear chat history
router.delete('/history', chatbotController.clearHistory);

export default router;
