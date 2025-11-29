const express = require('express');
const router = express.Router();
const roadmapController = require('../controllers/roadmapController');
const { protect } = require('../middlewares/authMiddleware');

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

module.exports = router;
