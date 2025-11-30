import { supabase } from '../lib/db.js';

// @desc    Get all companies
// @route   GET /api/companies
// @access  Private (admin/lawyer)
export const getAllCompanies = async (req, res) => {
  try {
    const { data: companies, error } = await supabase
      .from('companies')
      .select('id, user_id, name, industry, employee_count, incorporation_date, country, corporate_vehicle')
      .order('name', { ascending: true });

    if (error) throw error;

    res.status(200).json({
      success: true,
      count: companies.length,
      companies
    });
  } catch (error) {
    console.error('Get all companies error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching companies'
    });
  }
};

// @desc    Get company by ID
// @route   GET /api/companies/:id
// @access  Private
export const getCompanyById = async (req, res) => {
  try {
    const companyId = req.params.id;

    // Check authorization - user can only view their own company unless admin/lawyer
    if (req.user.company_id !== parseInt(companyId) &&
      !['admin', 'lawyer'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this company'
      });
    }

    const { data: company, error } = await supabase
      .from('companies')
      .select('*')
      .eq('id', companyId)
      .single();

    if (error) throw error;

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    res.status(200).json({
      success: true,
      company
    });
  } catch (error) {
    console.error('Get company by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching company'
    });
  }
};

// @desc    Create new company
// @route   POST /api/companies
// @access  Private (admin/lawyer)
export const createCompany = async (req, res) => {
  try {
    // Map frontend fields to actual DB columns
    const { name, industry, employees, incorporationDate, country, corporateVehicle } = req.body;
    const userId = req.user.id;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Company name is required'
      });
    }

    const { data: newCompany, error } = await supabase
      .from('companies')
      .insert([
        {
          user_id: userId,
          name,
          industry: industry || null,
          employee_count: employees || null,
          incorporation_date: incorporationDate || null,
          country: country || null,
          corporate_vehicle: corporateVehicle || null
        }
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      message: 'Company created successfully',
      company: newCompany
    });
  } catch (error) {
    console.error('Create company error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating company',
      error: error.message
    });
  }
};

// @desc    Update company
// @route   PUT /api/companies/:id
// @access  Private
export const updateCompany = async (req, res) => {
  try {
    const companyId = req.params.id;

    // Map frontend fields to actual DB columns
    const { name, industry, employees, incorporationDate, country, corporateVehicle } = req.body;

    // Check authorization
    if (req.user.company_id !== parseInt(companyId) &&
      !['admin', 'lawyer'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this company'
      });
    }

    const { data: updatedCompany, error } = await supabase
      .from('companies')
      .update({
        name: name || undefined, // undefined means don't update if not provided? No, logic was || null in original but here we might want to keep existing if not provided? Original used || null.
        industry: industry || null,
        employee_count: employees || null,
        incorporation_date: incorporationDate || null,
        country: country || null,
        corporate_vehicle: corporateVehicle || null
      })
      .eq('id', companyId)
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({
      success: true,
      message: 'Company updated successfully',
      data: updatedCompany
    });
  } catch (error) {
    console.error('Update company error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating company',
      error: error.message
    });
  }
};

// @desc    Save or update company (UPSERT)
// @route   POST /api/companies/upsert
// @access  Private
export const upsertCompany = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, industry, employees, incorporationDate, country, corporateVehicle } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Company name is required'
      });
    }

    // Upsert based on user_id? Or do we have a unique constraint?
    // Original code used INSERT ... ON DUPLICATE KEY UPDATE.
    // Assuming user_id is unique or we are upserting by ID if known?
    // Actually, the original code didn't specify WHERE, it relied on Unique Key.
    // If user_id is unique in companies table, we can upsert.
    // Or if we have company_id in req.user, we can try to update that.

    // Strategy: Check if company exists for user, if so update, else insert.
    const { data: existingCompany } = await supabase
      .from('companies')
      .select('id')
      .eq('user_id', userId)
      .single();

    let result;
    if (existingCompany) {
      // Update
      result = await supabase
        .from('companies')
        .update({
          name,
          industry: industry || null,
          employee_count: employees || null,
          incorporation_date: incorporationDate || null,
          country: country || null,
          corporate_vehicle: corporateVehicle || null
        })
        .eq('id', existingCompany.id)
        .select()
        .single();
    } else {
      // Insert
      result = await supabase
        .from('companies')
        .insert([{
          user_id: userId,
          name,
          industry: industry || null,
          employee_count: employees || null,
          incorporation_date: incorporationDate || null,
          country: country || null,
          corporate_vehicle: corporateVehicle || null
        }])
        .select()
        .single();
    }

    if (result.error) throw result.error;

    res.status(200).json({
      success: true,
      message: existingCompany ? 'Company updated successfully' : 'Company created successfully',
      data: result.data
    });
  } catch (error) {
    console.error('Upsert company error:', error);
    res.status(500).json({
      success: false,
      message: 'Error saving company',
      error: error.message
    });
  }
};

// @desc    Delete company
// @route   DELETE /api/companies/:id
// @access  Private (admin only)
export const deleteCompany = async (req, res) => {
  try {
    const companyId = req.params.id;

    const { error } = await supabase
      .from('companies')
      .delete()
      .eq('id', companyId);

    if (error) throw error;

    res.status(200).json({
      success: true,
      message: 'Company deleted successfully'
    });
  } catch (error) {
    console.error('Delete company error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting company'
    });
  }
};
