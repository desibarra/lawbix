const pool = require('../database/db');

// @desc    Get database schema for companies table (DEBUG)
// @route   GET /api/companies/schema
// @access  Private
exports.getSchema = async (req, res) => {
  try {
    console.log('\n=== CHECKING DATABASE SCHEMA ===');

    // Check if companies table exists
    const [tables] = await pool.query("SHOW TABLES LIKE 'companies'");

    if (tables.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Companies table does not exist',
        availableTables: await pool.query('SHOW TABLES')
      });
    }

    // Get column structure
    const [columns] = await pool.query('SHOW COLUMNS FROM companies');

    console.log('Companies table columns:');
    columns.forEach(col => {
      console.log(`  - ${col.Field} (${col.Type}) ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${col.Key ? `KEY: ${col.Key}` : ''}`);
    });
    console.log('===================================\n');

    res.status(200).json({
      success: true,
      table: 'companies',
      columns: columns.map(col => ({
        field: col.Field,
        type: col.Type,
        null: col.Null,
        key: col.Key,
        default: col.Default,
        extra: col.Extra
      }))
    });
  } catch (error) {
    console.error('\n=== SCHEMA CHECK ERROR ===');
    console.error('Error:', error.message);
    console.error('Code:', error.code);
    console.error('==========================\n');

    res.status(500).json({
      success: false,
      message: 'Error checking database schema',
      error: error.message
    });
  }
};

// @desc    Get all companies
// @route   GET /api/companies
// @access  Private (admin/lawyer)
exports.getAllCompanies = async (req, res) => {
  try {
    const [companies] = await pool.query(
      'SELECT id, user_id, name, industry, employee_count, incorporation_date, country, corporate_vehicle FROM companies ORDER BY name ASC'
    );

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
exports.getCompanyById = async (req, res) => {
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

    const [companies] = await pool.query(
      'SELECT * FROM companies WHERE id = ?',
      [companyId]
    );

    if (companies.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    res.status(200).json({
      success: true,
      company: companies[0]
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
exports.createCompany = async (req, res) => {
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

    console.log('\n=== CREATE COMPANY (DB Schema Match) ===');
    console.log('User ID:', userId);
    console.log('Data:', { name, industry, employees, incorporationDate, country, corporateVehicle });

    const [result] = await pool.query(
      'INSERT INTO companies (user_id, name, industry, employee_count, incorporation_date, country, corporate_vehicle) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [userId, name, industry || null, employees || null, incorporationDate || null, country || null, corporateVehicle || null]
    );

    console.log('CREATE successful - Company ID:', result.insertId);
    console.log('=========================================\n');

    res.status(201).json({
      success: true,
      message: 'Company created successfully',
      company: {
        id: result.insertId,
        name,
        industry,
        employee_count: employees,
        incorporation_date: incorporationDate,
        country,
        corporate_vehicle: corporateVehicle
      }
    });
  } catch (error) {
    console.error('\n=== SQL ERROR (Create Company) ===');
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('SQL Message:', error.sqlMessage);
    console.error('SQL Query:', error.sql);
    console.error('===================================\n');

    res.status(500).json({
      success: false,
      message: 'Error creating company',
      error: error.message,
      sqlError: error.sqlMessage
    });
  }
};

// @desc    Update company
// @route   PUT /api/companies/:id
// @access  Private
exports.updateCompany = async (req, res) => {
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

    console.log('\n=== UPDATE COMPANY (DB Schema Match) ===');
    console.log('Company ID:', companyId);
    console.log('Data:', { name, industry, employees, incorporationDate, country, corporateVehicle });
    console.log('Mapping: employees->employee_count, incorporationDate->incorporation_date');

    await pool.query(
      'UPDATE companies SET name = ?, industry = ?, employee_count = ?, incorporation_date = ?, country = ?, corporate_vehicle = ? WHERE id = ?',
      [name || null, industry || null, employees || null, incorporationDate || null, country || null, corporateVehicle || null, companyId]
    );

    console.log('UPDATE successful');
    console.log('=========================================\n');

    // Get updated company
    const [companies] = await pool.query('SELECT * FROM companies WHERE id = ?', [companyId]);

    res.status(200).json({
      success: true,
      message: 'Company updated successfully',
      data: companies[0]
    });
  } catch (error) {
    console.error('\n=== SQL ERROR (Update Company) ===');
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('SQL Message:', error.sqlMessage);
    console.error('SQL Query:', error.sql);
    console.error('===================================\n');

    res.status(500).json({
      success: false,
      message: 'Error updating company',
      error: error.message,
      sqlError: error.sqlMessage
    });
  }
};

// @desc    Save or update company (UPSERT)
// @route   POST /api/companies/upsert
// @access  Private
exports.upsertCompany = async (req, res) => {
  try {
    const userId = req.user.id;

    // Map frontend fields to actual DB columns
    const { name, industry, employees, incorporationDate, country, corporateVehicle } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Company name is required'
      });
    }

    console.log('\n=== UPSERT COMPANY (DB Schema Match) ===');
    console.log('User ID:', userId);
    console.log('Data:', { name, industry, employees, incorporationDate, country, corporateVehicle });

    // Try INSERT first, if user_id already exists, UPDATE
    const [result] = await pool.query(
      `INSERT INTO companies (user_id, name, industry, employee_count, incorporation_date, country, corporate_vehicle)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
       name = VALUES(name),
       industry = VALUES(industry),
       employee_count = VALUES(employee_count),
       incorporation_date = VALUES(incorporation_date),
       country = VALUES(country),
       corporate_vehicle = VALUES(corporate_vehicle)`,
      [userId, name, industry || null, employees || null, incorporationDate || null, country || null, corporateVehicle || null]
    );

    const companyId = result.insertId || req.user.company_id;
    console.log('UPSERT successful - Company ID:', companyId);
    console.log('=========================================\n');

    // Get the saved company
    const [companies] = await pool.query('SELECT * FROM companies WHERE id = ?', [companyId]);

    res.status(200).json({
      success: true,
      message: result.insertId ? 'Company created successfully' : 'Company updated successfully',
      data: companies[0]
    });
  } catch (error) {
    console.error('\n=== SQL ERROR (Upsert Company) ===');
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('SQL Message:', error.sqlMessage);
    console.error('SQL Query:', error.sql);
    console.error('===================================\n');

    res.status(500).json({
      success: false,
      message: 'Error saving company',
      error: error.message,
      sqlError: error.sqlMessage
    });
  }
};

// @desc    Delete company
// @route   DELETE /api/companies/:id
// @access  Private (admin only)
exports.deleteCompany = async (req, res) => {
  try {
    const companyId = req.params.id;

    await pool.query('DELETE FROM companies WHERE id = ?', [companyId]);

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
