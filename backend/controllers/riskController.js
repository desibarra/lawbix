import { supabase } from '../lib/db.js';

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

// @desc    Get all risks for company
// @route   GET /api/risks
// @access  Private
export const getRisks = async (req, res) => {
  try {
    const userId = req.user.id;

    // STEP 1: Find user's company
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (companyError || !company) {
      return res.status(200).json({
        success: true,
        count: 3,
        risks: getMockRisks(),
        source: 'mock_no_company',
        message: 'No company found. Please register your company first.'
      });
    }

    const companyId = company.id;

    // STEP 2: Get risks for company
    let risks = [];
    let tableName = 'risks';

    // Try risks table first
    const { data: risksData, error: risksError } = await supabase
      .from('risks')
      .select('*')
      .eq('company_id', companyId)
      .order('severity', { ascending: false });

    if (!risksError) {
      risks = risksData;
    } else {
      // Try risk_flags
      if (risksError.code === '42P01') { // undefined_table
        const { data: flagsData, error: flagsError } = await supabase
          .from('risk_flags')
          .select('*')
          .eq('company_id', companyId)
          .order('severity', { ascending: false });

        if (!flagsError) {
          risks = flagsData;
          tableName = 'risk_flags';
        } else {
          risks = [];
        }
      } else {
        risks = [];
      }
    }

    // If no risks found in DB, return sample data
    if (!risks || risks.length === 0) {
      risks = getMockRisks();
      tableName = null;
    }

    res.status(200).json({
      success: true,
      count: risks.length,
      risks,
      source: tableName || 'mock_data',
      message: risks.length === 3 && !tableName ? 'Mostrando riesgos de ejemplo. Complete el diagnóstico para análisis personalizado.' : undefined
    });

  } catch (error) {
    console.error('Get risks error:', error);
    res.status(200).json({
      success: true,
      count: 3,
      risks: getMockRisks(),
      source: 'fallback',
      error: error.message
    });
  }
};

// @desc    Get risks by severity
// @route   GET /api/risks/severity/:level
// @access  Private
export const getBySeverity = async (req, res) => {
  try {
    const companyId = req.user.company_id;
    const severity = req.params.level;

    const { data: risks, error } = await supabase
      .from('risks')
      .select('*')
      .eq('company_id', companyId)
      .eq('severity', severity)
      .order('created_at', { ascending: false });

    if (error) throw error;

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
export const getRiskStats = async (req, res) => {
  try {
    const companyId = req.user.company_id;

    // Supabase doesn't support GROUP BY directly in JS client easily without .rpc() or client-side aggregation
    // We'll fetch all risks (lightweight) and aggregate in JS for now, assuming not millions of risks per company
    const { data: risks, error } = await supabase
      .from('risks')
      .select('severity')
      .eq('company_id', companyId);

    if (error) throw error;

    const total = risks.length;
    const stats = {};
    risks.forEach(r => {
      stats[r.severity] = (stats[r.severity] || 0) + 1;
    });

    // Convert to array format expected by frontend if needed, or just object
    // Original SQL returned [{severity: 'high', count: 5}, ...]
    const statsArray = Object.keys(stats).map(key => ({ severity: key, count: stats[key] }));

    res.status(200).json({
      success: true,
      stats: {
        total,
        by_severity: statsArray
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
export const createRisk = async (req, res) => {
  try {
    const { title, description, category, severity, probability, impact } = req.body;
    const companyId = req.user.company_id;

    if (!title || !severity) {
      return res.status(400).json({
        success: false,
        message: 'Title and severity are required'
      });
    }

    const { data: newRisk, error } = await supabase
      .from('risks')
      .insert([
        {
          company_id: companyId,
          title,
          description,
          category,
          severity,
          probability,
          impact,
          status: 'open'
        }
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      message: 'Risk created successfully',
      risk: newRisk
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
export const updateRisk = async (req, res) => {
  try {
    const riskId = req.params.id;
    const { title, description, category, severity, probability, impact, status } = req.body;

    const { error } = await supabase
      .from('risks')
      .update({
        title,
        description,
        category,
        severity,
        probability,
        impact,
        status
      })
      .eq('id', riskId);

    if (error) throw error;

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
export const deleteRisk = async (req, res) => {
  try {
    const riskId = req.params.id;

    const { error } = await supabase
      .from('risks')
      .delete()
      .eq('id', riskId);

    if (error) throw error;

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
