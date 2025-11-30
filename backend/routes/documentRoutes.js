import express from 'express';
const router = express.Router();
import * as documentController from '../controllers/documentsControllerNew.js';
import { protect } from '../middlewares/authMiddleware.js';

// All document routes require authentication
router.use(protect);

// Get available document templates
router.get('/templates', documentController.getTemplates);

// Generate a new document
router.post('/generate', documentController.generateDocument);

// Get user's documents
router.get('/', documentController.listDocuments);

// Download a specific document
router.get('/download/:id', documentController.downloadDocument);

// Delete a document
router.delete('/:id', documentController.deleteDocument);

export default router;
