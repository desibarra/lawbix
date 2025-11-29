const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// DEBUG: Get database schema (public route for debugging)
router.get('/schema', companyController.getSchema);

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

module.exports = router;
