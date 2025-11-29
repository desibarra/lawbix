const express = require('express');
const router = express.Router();
const riskController = require('../controllers/riskController');
const { protect } = require('../middlewares/authMiddleware');

// All risk routes require authentication
router.use(protect);

// Get all risks for user's company
router.get('/', riskController.getRisks);

// Get risks by severity level
router.get('/severity/:level', riskController.getBySeverity);

// Get risk statistics
router.get('/stats', riskController.getRiskStats);

// Create new risk
router.post('/', riskController.createRisk);

// Update risk
router.put('/:id', riskController.updateRisk);

// Delete risk
router.delete('/:id', riskController.deleteRisk);

module.exports = router;
