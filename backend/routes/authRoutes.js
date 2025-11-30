import express from 'express';
const router = express.Router();
import * as authController from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';

// Public routes
router.post('/login', authController.login);
router.post('/register', authController.register);

// Protected routes
router.get('/me', protect, authController.getMe);

export default router;
