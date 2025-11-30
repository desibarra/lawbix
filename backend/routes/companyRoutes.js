import express from 'express';
const router = express.Router();
import * as companyController from '../controllers/companyController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

// DEBUG: Get database schema (public route for debugging)
// router.get('/schema', companyController.getSchema); // Disabled for Supabase migration

// All company routes require authentication
router.use(protect);

// Get all companies (admin/lawyer only)
router.get('/', authorize('admin', 'lawyer'), companyController.getAllCompanies);

// UPSERT company (any authenticated user)
router.post('/upsert', companyController.upsertCompany);

// Create new company (admin/lawyer only)
router.post('/', authorize('admin', 'lawyer'), companyController.createCompany);

// Get specific company
router.get('/:id', companyController.getCompanyById);

// Update company
router.put('/:id', companyController.updateCompany);

// Delete company (admin only)
router.delete('/:id', authorize('admin'), companyController.deleteCompany);

export default router;
