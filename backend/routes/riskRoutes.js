import express from 'express';
const router = express.Router();
import * as riskController from '../controllers/riskController.js';
import { protect } from '../middlewares/authMiddleware.js';

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

export default router;
