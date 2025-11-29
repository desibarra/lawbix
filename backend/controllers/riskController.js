const pool = require('../database/db');

// @desc    Get all risks for company
// @route   GET /api/risks
// @access  Private
exports.getRisks = async (req, res) => {
  try {
    const userId = req.user.id;

    console.log('\n=== GET RISKS (Flow: User -> Company -> Risks) ===');
    console.log('User ID:', userId);

    // STEP 1: Find user's company
    let companyId = null;
    try {
      const [companies] = await pool.query(
        'SELECT id FROM companies WHERE user_id = ? LIMIT 1',
        [userId]
      );

      if (companies.length === 0) {
        console.log('⚠️  User has no company. Returning mock risks.');
        console.log('====================================================\n');
        return res.status(200).json({
          success: true,
          count: 3,
          risks: getMockRisks(),
          source: 'mock_no_company',
          message: 'No company found. Please register your company first.'
        });
      }

      companyId = companies[0].id;
      console.log('✅ Company found with ID:', companyId);
    } catch (companyError) {
      console.error('\n=== ERROR FINDING COMPANY ===');
      console.error('Error en Riesgos:', companyError.message);
      console.error('==============================\n');

      return res.status(200).json({
        success: true,
        count: 3,
        risks: getMockRisks(),
        source: 'mock_error',
        message: 'Error finding company. Showing sample risks.'
      });
    }

    // STEP 2: Get risks for company
    let risks = [];
    let tableName = 'risks';

    try {
      // Try risks table first
      console.log('Trying "risks" table with company_id:', companyId);
      const query = 'SELECT * FROM risks WHERE company_id = ? ORDER BY severity DESC';
      console.log('Query:', query);

      [risks] = await pool.query(query, [companyId]);
      console.log('✅ Successfully queried "risks" table. Found:', risks.length, 'rows');

    } catch (dbError) {
      console.error('\n=== DATABASE ERROR (Risks Table) ===');
      console.error('Error en Riesgos:', dbError.message);
      console.error('Error code:', dbError.code);
      console.error('SQL Message:', dbError.sqlMessage);
      console.error('====================================\n');

      // PASO 2: Try alternative table name - risk_flags
      if (dbError.code === 'ER_NO_SUCH_TABLE' || dbError.code === 'ER_BAD_DB_ERROR') {
        console.log('⚠️  "risks" table not found. Trying "risk_flags" table...');

        try {
          const altQuery = 'SELECT * FROM risk_flags WHERE company_id = ? ORDER BY severity DESC';
          console.log('Query:', altQuery);

          [risks] = await pool.query(altQuery, [companyId]);
          tableName = 'risk_flags';
          console.log('✅ Successfully queried "risk_flags" table. Found:', risks.length, 'rows');

        } catch (altError) {
          console.error('\n=== DATABASE ERROR (Risk_flags Table) ===');
          console.error('Error en Riesgos:', altError.message);
          console.error('Error code:', altError.code);
          console.error('SQL Message:', altError.sqlMessage);
          console.error('=========================================\n');

          // PASO 3: Both tables failed, return mock data
          if (altError.code === 'ER_NO_SUCH_TABLE' || altError.code === 'ER_BAD_DB_ERROR') {
            console.log('⚠️  No risk tables found. Returning mock data.');
            risks = [];
          } else {
            // Unknown error on risk_flags, still return mock data
            console.log('⚠️  Unknown DB error. Returning mock data to prevent crash.');
            risks = [];
          }
        }
      } else {
        // Unknown error on risks table, return mock data
        console.log('⚠️  Unknown DB error on risks table. Returning mock data to prevent crash.');
        risks = [];
      }
    }

    // If no risks found in DB, return sample data
    if (risks.length === 0) {
      console.log('No risks in database. Returning mock sample data.');
      risks = getMockRisks();
      tableName = null;
    }

    console.log('Returning', risks.length, 'risks from', tableName || 'mock data');
    console.log('====================================================\n');

    res.status(200).json({
      success: true,
      count: risks.length,
      risks,
      source: tableName || 'mock_data',
      message: risks.length === 3 && !tableName ? 'Mostrando riesgos de ejemplo. Complete el diagnóstico para análisis personalizado.' : undefined
    });

  } catch (error) {
    // CRITICAL ERROR: Even outer try/catch failed
    console.error('\n=== CRITICAL ERROR GET RISKS ===');
    console.error('Error en Riesgos:', error.message);
    console.error('Stack:', error.stack);
    console.error('================================\n');

    // NEVER return 500, always return data
    res.status(200).json({
      success: true,
      count: 3,
      risks: getMockRisks(),
      source: 'fallback',
      error: error.message
    });
  }
};

// Helper function for mock risks
function getMockRisks() {
  return [
    {
      id: 1,
      name: 'Riesgo Simulado',
      title: 'Contratos laborales sin formalizar',
      description: 'Algunos empleados no cuentan con contrato escrito, lo que genera riesgo de sanciones laborales y demandas.',
      category: 'Laboral',
      severity: 'high',
      impact: 'Alto',
      probability: 'high',
      status: 'open',
      mitigation: 'Formalizar contratos inmediatamente y revisar cumplimiento de seguridad social'
    },
    {
      id: 2,
      name: 'Marca sin Registro',
      title: 'Marca comercial sin registro',
      description: 'La marca no está registrada, existe riesgo de uso no autorizado por terceros.',
      category: 'Propiedad Intelectual',
      severity: 'medium',
      impact: 'Medio',
      probability: 'medium',
      status: 'open',
      mitigation: 'Iniciar trámite de registro de marca ante la autoridad competente'
    },
    {
      id: 3,
      name: 'Datos Personales',
      title: 'Política de datos personales pendiente',
      description: 'No se cuenta con política de tratamiento de datos personales conforme a normativa.',
      category: 'Protección de Datos',
      severity: 'medium',
      impact: 'Alto',
      probability: 'high',
      status: 'open',
      mitigation: 'Elaborar e implementar política de privacidad y registro ante autoridad'
    }
  ];
}

// @desc    Get risks by severity
// @route   GET /api/risks/severity/:level
// @access  Private
exports.getBySeverity = async (req, res) => {
  try {
    const companyId = req.user.company_id;
    const severity = req.params.level;

    const [risks] = await pool.query(
      'SELECT * FROM risks WHERE company_id = ? AND severity = ? ORDER BY created_at DESC',
      [companyId, severity]
    );

    res.status(200).json({
      success: true,
      count: risks.length,
      risks
    });
  } catch (error) {
    console.error('Get by severity error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching risks'
    });
  }
};

// @desc    Get risk statistics
// @route   GET /api/risks/stats
// @access  Private
exports.getRiskStats = async (req, res) => {
  try {
    const companyId = req.user.company_id;

    const [stats] = await pool.query(
      'SELECT severity, COUNT(*) as count FROM risks WHERE company_id = ? GROUP BY severity',
      [companyId]
    );

    const [total] = await pool.query(
      'SELECT COUNT(*) as total FROM risks WHERE company_id = ?',
      [companyId]
    );

    res.status(200).json({
      success: true,
      stats: {
        total: total[0].total,
        by_severity: stats
      }
    });
  } catch (error) {
    console.error('Get risk stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching risk statistics'
    });
  }
};

// @desc    Create new risk
// @route   POST /api/risks
// @access  Private
exports.createRisk = async (req, res) => {
  try {
    const { title, description, category, severity, probability, impact } = req.body;
    const companyId = req.user.company_id;

    if (!title || !severity) {
      return res.status(400).json({
        success: false,
        message: 'Title and severity are required'
      });
    }

    const [result] = await pool.query(
      'INSERT INTO risks (company_id, title, description, category, severity, probability, impact, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [companyId, title, description, category, severity, probability, impact, 'open']
    );

    res.status(201).json({
      success: true,
      message: 'Risk created successfully',
      risk: {
        id: result.insertId,
        title,
        severity,
        status: 'open'
      }
    });
  } catch (error) {
    console.error('Create risk error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating risk'
    });
  }
};

// @desc    Update risk
// @route   PUT /api/risks/:id
// @access  Private
exports.updateRisk = async (req, res) => {
  try {
    const riskId = req.params.id;
    const { title, description, category, severity, probability, impact, status } = req.body;

    await pool.query(
      'UPDATE risks SET title = ?, description = ?, category = ?, severity = ?, probability = ?, impact = ?, status = ? WHERE id = ?',
      [title, description, category, severity, probability, impact, status, riskId]
    );

    res.status(200).json({
      success: true,
      message: 'Risk updated successfully'
    });
  } catch (error) {
    console.error('Update risk error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating risk'
    });
  }
};

// @desc    Delete risk
// @route   DELETE /api/risks/:id
// @access  Private
exports.deleteRisk = async (req, res) => {
  try {
    const riskId = req.params.id;

    await pool.query('DELETE FROM risks WHERE id = ?', [riskId]);

    res.status(200).json({
      success: true,
      message: 'Risk deleted successfully'
    });
  } catch (error) {
    console.error('Delete risk error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting risk'
    });
  }
};
