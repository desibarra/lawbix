const express = require('express');
const router = express.Router();
const diagnosisController = require('../controllers/diagnosisController');
const { protect } = require('../middlewares/authMiddleware');

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

module.exports = router;
