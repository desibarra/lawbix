import express from 'express';
const router = express.Router();
import * as diagnosisController from '../controllers/diagnosisController.js';
import { protect } from '../middlewares/authMiddleware.js';

// All diagnosis routes require authentication
router.use(protect);

// Get diagnosis questions
router.get('/questions', diagnosisController.getQuestions);

// Submit diagnosis answers
router.post('/submit', diagnosisController.submitDiagnosis);

// Get diagnosis results for current user's company
router.get('/results', diagnosisController.getResults);

// Get specific diagnosis by ID
router.get('/:id', diagnosisController.getDiagnosisById);

export default router;
