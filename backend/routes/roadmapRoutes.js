import express from 'express';
const router = express.Router();
import * as roadmapController from '../controllers/roadmapController.js';
import { protect } from '../middlewares/authMiddleware.js';

// All roadmap routes require authentication
router.use(protect);

// Get roadmap for user's company
router.get('/', roadmapController.getRoadmap);

// Get roadmap items by priority
router.get('/priority/:level', roadmapController.getByPriority);

// Create new roadmap item
router.post('/', roadmapController.createRoadmapItem);

// Update roadmap item
router.put('/:id', roadmapController.updateRoadmapItem);

// Mark roadmap item as completed
router.patch('/:id/complete', roadmapController.markAsCompleted);

// Delete roadmap item
router.delete('/:id', roadmapController.deleteRoadmapItem);

export default router;
