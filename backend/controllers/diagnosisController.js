const pool = require('../database/db');

// Hardcoded legal questions array - no database table needed
const LEGAL_QUESTIONS = [
  {
    id: 1,
    category: 'Corporativo',
    question: '¿Su empresa está debidamente constituida con RUT/NIT vigente?',
    options: ['Sí, completamente', 'No', 'En trámite'],
    weight: 10
  },
  {
    id: 2,
    category: 'Corporativo',
    question: '¿Cuenta con libro de actas de junta directiva actualizado?',
    options: ['Sí', 'No', 'Parcialmente'],
    weight: 8
  },
  {
    id: 3,
    category: 'Corporativo',
    question: '¿Tiene estatutos sociales registrados y actualizados?',
    options: ['Sí', 'No', 'Desactualizado'],
    weight: 9
  },
  {
    id: 4,
    category: 'Laboral',
    question: '¿Todos sus empleados tienen contratos laborales formalizados?',
    options: ['Sí, todos', 'No', 'Algunos'],
    weight: 10
  },
  {
    id: 5,
    category: 'Laboral',
    question: '¿Está al día con aportes de seguridad social y parafiscales?',
    options: ['Sí', 'No', 'Con atrasos'],
    weight: 10
  },
  {
    id: 6,
    category: 'Laboral',
    question: '¿Cuenta con reglamento interno de trabajo aprobado?',
    options: ['Sí', 'No', 'En proceso'],
    weight: 7
  },
  {
    id: 7,
    category: 'Laboral',
    question: '¿Tiene implementado el Sistema de Gestión de Seguridad y Salud en el Trabajo (SG-SST)?',
    options: ['Sí, implementado', 'No', 'Parcialmente'],
    weight: 9
  },
  {
    id: 8,
    category: 'Fiscal',
    question: '¿Presenta oportunamente sus declaraciones tributarias?',
    options: ['Sí, siempre', 'No', 'A veces con retraso'],
    weight: 10
  },
  {
    id: 9,
    category: 'Fiscal',
    question: '¿Tiene facturas electrónicas habilitadas?',
    options: ['Sí', 'No', 'En implementación'],
    weight: 8
  },
  {
    id: 10,
    category: 'Fiscal',
    question: '¿Mantiene su contabilidad al día según normativa vigente?',
    options: ['Sí', 'No', 'Con atrasos'],
    weight: 9
  },
  {
    id: 11,
    category: 'Propiedad Intelectual',
    question: '¿Ha registrado su marca comercial?',
    options: ['Sí, registrada', 'No', 'En trámite'],
    weight: 7
  },
  {
    id: 12,
    category: 'Propiedad Intelectual',
    question: '¿Protege sus derechos de autor y propiedad industrial?',
    options: ['Sí', 'No', 'Parcialmente'],
    weight: 6
  },
  {
    id: 13,
    category: 'Propiedad Intelectual',
    question: '¿Tiene contratos de confidencialidad con empleados y proveedores?',
    options: ['Sí', 'No', 'Solo con algunos'],
    weight: 7
  },
  {
    id: 14,
    category: 'Protección de Datos',
    question: '¿Cuenta con política de tratamiento de datos personales?',
    options: ['Sí, implementada', 'No', 'En desarrollo'],
    weight: 9
  },
  {
    id: 15,
    category: 'Protección de Datos',
    question: '¿Está registrado como responsable de tratamiento de datos ante la autoridad competente?',
    options: ['Sí', 'No', 'No aplica'],
    weight: 8
  }
];

// @desc    Get diagnosis questions
// @route   GET /api/diagnosis/questions
// @access  Private
exports.getQuestions = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      count: LEGAL_QUESTIONS.length,
      questions: LEGAL_QUESTIONS
    });
  } catch (error) {
    console.error('Get questions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching questions'
    });
  }
};

// @desc    Submit diagnosis answers
// @route   POST /api/diagnosis/submit
// @access  Private
exports.submitDiagnosis = async (req, res) => {
  try {
    const { answers } = req.body;
    const userId = req.user.id;

    console.log('\n=== SUBMIT DIAGNOSIS (Flow: User -> Company -> Save) ===');
    console.log('User ID:', userId);

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: 'Answers array is required'
      });
    }

    // STEP 1: Find user's company
    let companyId = null;
    try {
      const [companies] = await pool.query(
        'SELECT id FROM companies WHERE user_id = ? LIMIT 1',
        [userId]
      );

      if (companies.length > 0) {
        companyId = companies[0].id;
        console.log('✅ Company found with ID:', companyId);
      } else {
        console.log('⚠️  User has no company. Will save with company_id = NULL');
      }
    } catch (companyError) {
      console.error('⚠️  Error finding company:', companyError.message);
      console.log('Will save diagnosis with company_id = NULL');
    }

    // Calculate compliance score based on answers
    let totalScore = 0;
    let maxScore = 0;

    answers.forEach(answer => {
      const question = LEGAL_QUESTIONS.find(q => q.id === answer.question_id);
      if (question) {
        maxScore += question.weight;

        // Score based on answer
        if (answer.answer === question.options[0]) {
          // First option is usually the positive one
          totalScore += question.weight;
        } else if (answer.answer === question.options[2]) {
          // Third option is usually partial compliance
          totalScore += Math.floor(question.weight * 0.5);
        }
        // Second option (usually "No") gets 0 points
      }
    });

    const complianceScore = Math.round((totalScore / maxScore) * 100);

    // Determine risk level based on compliance score
    let riskLevel = 'bajo';
    if (complianceScore < 50) {
      riskLevel = 'alto';
    } else if (complianceScore < 75) {
      riskLevel = 'medio';
    }

    // Calculate category scores
    const categoryScores = {};
    LEGAL_QUESTIONS.forEach(q => {
      if (!categoryScores[q.category]) {
        categoryScores[q.category] = { total: 0, max: 0 };
      }
      categoryScores[q.category].max += q.weight;

      const answer = answers.find(a => a.question_id === q.id);
      if (answer && answer.answer === q.options[0]) {
        categoryScores[q.category].total += q.weight;
      } else if (answer && answer.answer === q.options[2]) {
        categoryScores[q.category].total += Math.floor(q.weight * 0.5);
      }
    });

    // STEP 2: Save diagnosis to database
    console.log('Saving diagnosis - Score:', complianceScore, '| Risk:', riskLevel);
    console.log('Company ID to save:', companyId);

    if (!companyId) {
      console.warn('⚠️  No company_id available. Cannot save diagnosis.');
      return res.status(200).json({
        success: true,
        message: 'Diagnosis calculated successfully (not saved - no company found)',
        diagnosis: {
          compliance_score: complianceScore,
          risk_level: riskLevel,
          category_scores: categoryScores,
          total_questions: answers.length,
          created_at: new Date()
        }
      });
    }

    try {
      const [result] = await pool.query(
        'INSERT INTO diagnosis_results (company_id, compliance_score, risk_level, answers_data, created_at) VALUES (?, ?, ?, ?, NOW())',
        [companyId, complianceScore, riskLevel, JSON.stringify(answers)]
      );

      console.log('✅ Diagnosis saved with ID:', result.insertId);
      console.log('=========================================================\n');

      res.status(201).json({
        success: true,
        message: 'Diagnosis submitted successfully',
        diagnosis: {
          id: result.insertId,
          compliance_score: complianceScore,
          risk_level: riskLevel,
          category_scores: categoryScores,
          total_questions: answers.length,
          created_at: new Date()
        }
      });
    } catch (dbError) {
      console.error('\n=== DATABASE ERROR (Submit Diagnosis) ===');
      console.error('Error en Diagnóstico:', dbError.message);
      console.error('Error code:', dbError.code);
      console.error('SQL Message:', dbError.sqlMessage);
      console.error('==========================================\n');

      // If table doesn't exist or column mismatch, still return results without saving
      if (dbError.code === 'ER_NO_SUCH_TABLE' || dbError.code === 'ER_BAD_DB_ERROR' || dbError.code === 'ER_BAD_FIELD_ERROR') {
        console.warn('⚠️  Database issue. Returning results without saving to DB.');
        return res.status(200).json({
          success: true,
          message: 'Diagnosis calculated successfully (results not persisted to database)',
          diagnosis: {
            compliance_score: complianceScore,
            risk_level: riskLevel,
            category_scores: categoryScores,
            total_questions: answers.length,
            created_at: new Date()
          }
        });
      }

      // For any other DB error, still return success with results
      console.warn('⚠️  Unexpected DB error. Returning calculated results anyway.');
      return res.status(200).json({
        success: true,
        message: 'Diagnosis calculated (could not save: ' + dbError.message + ')',
        diagnosis: {
          compliance_score: complianceScore,
          risk_level: riskLevel,
          category_scores: categoryScores,
          total_questions: answers.length,
          created_at: new Date()
        }
      });
    }
  } catch (error) {
    console.error('\n=== CRITICAL ERROR SUBMIT DIAGNOSIS ===');
    console.error('Error en Diagnóstico:', error.message);
    console.error('Stack:', error.stack);
    console.error('========================================\n');

    // Even in critical error, don't return 500
    res.status(200).json({
      success: false,
      message: 'Error submitting diagnosis',
      error: error.message
    });
  }
};

// @desc    Get diagnosis results
// @route   GET /api/diagnosis/results
// @access  Private
exports.getResults = async (req, res) => {
  try {
    const userId = req.user.id;

    console.log('\n=== GET DIAGNOSIS RESULTS (Flow: User -> Company -> Diagnosis) ===');
    console.log('User ID:', userId);

    // STEP 1: Find user's company
    let companyId = null;
    try {
      const [companies] = await pool.query(
        'SELECT id FROM companies WHERE user_id = ? LIMIT 1',
        [userId]
      );

      if (companies.length === 0) {
        console.log('⚠️  User has no company registered');
        console.log('===================================================================\n');
        return res.status(200).json({
          success: true,
          diagnosis: null,
          results: [],
          message: 'No company found. Please register your company first.'
        });
      }

      companyId = companies[0].id;
      console.log('✅ Company found with ID:', companyId);
    } catch (companyError) {
      console.error('\n=== ERROR FINDING COMPANY ===');
      console.error('Error en Diagnóstico:', companyError.message);
      console.error('SQL Message:', companyError.sqlMessage);
      console.error('==============================\n');

      if (companyError.code === 'ER_NO_SUCH_TABLE' || companyError.code === 'ER_BAD_DB_ERROR') {
        return res.status(200).json({
          success: true,
          diagnosis: null,
          results: [],
          message: 'Companies table not found. Database may need setup.'
        });
      }

      return res.status(200).json({
        success: false,
        diagnosis: null,
        results: [],
        message: 'Error finding company: ' + companyError.message
      });
    }

    // STEP 2: Get diagnosis results for company
    try {
      const query = 'SELECT * FROM diagnosis_results WHERE company_id = ? ORDER BY created_at DESC LIMIT 1';
      console.log('Query:', query);
      console.log('Params:', [companyId]);

      const [results] = await pool.query(query, [companyId]);

      if (results.length === 0) {
        console.log('No diagnosis results found for company');
        console.log('===================================================================\n');
        return res.status(200).json({
          success: true,
          diagnosis: null,
          results: [],
          message: 'No diagnosis results found. Please complete a diagnosis first.'
        });
      }

      const diagnosis = results[0];

      // Parse answers_data if it's a string
      if (typeof diagnosis.answers_data === 'string') {
        try {
          diagnosis.answers_data = JSON.parse(diagnosis.answers_data);
        } catch (e) {
          console.log('⚠️  Could not parse answers_data');
          diagnosis.answers_data = [];
        }
      }

      console.log('✅ Diagnosis found - ID:', diagnosis.id, '| Score:', diagnosis.compliance_score);
      console.log('===================================================================\n');

      res.status(200).json({
        success: true,
        diagnosis,
        results: [diagnosis]
      });
    } catch (dbError) {
      console.error('\n=== DATABASE ERROR (Diagnosis Results) ===');
      console.error('Error en Diagnóstico:', dbError.message);
      console.error('Error code:', dbError.code);
      console.error('SQL Message:', dbError.sqlMessage);
      console.error('SQL Query:', dbError.sql);
      console.error('===========================================\n');

      // If table doesn't exist, return empty result
      if (dbError.code === 'ER_NO_SUCH_TABLE' || dbError.code === 'ER_BAD_DB_ERROR') {
        console.log('⚠️  diagnosis_results table does not exist');
        return res.status(200).json({
          success: true,
          diagnosis: null,
          results: [],
          message: 'Diagnosis table not found. Please complete a diagnosis first.'
        });
      }

      // For any other DB error (including column mismatch)
      if (dbError.code === 'ER_BAD_FIELD_ERROR') {
        console.log('⚠️  Column mismatch in diagnosis_results table');
        return res.status(200).json({
          success: true,
          diagnosis: null,
          results: [],
          message: 'Database schema mismatch. Please contact administrator.'
        });
      }

      return res.status(200).json({
        success: false,
        diagnosis: null,
        results: [],
        message: 'Error fetching diagnosis: ' + dbError.message
      });
    }
  } catch (error) {
    console.error('\n=== CRITICAL ERROR GET RESULTS ===');
    console.error('Error en Diagnóstico:', error.message);
    console.error('Stack:', error.stack);
    console.error('===================================\n');

    res.status(200).json({
      success: false,
      diagnosis: null,
      results: [],
      message: 'Critical error fetching diagnosis results',
      error: error.message
    });
  }
};

// @desc    Get specific diagnosis by ID
// @route   GET /api/diagnosis/:id
// @access  Private
exports.getDiagnosisById = async (req, res) => {
  try {
    const diagnosisId = req.params.id;
    const companyId = req.user.company_id;

    const [results] = await pool.query(
      'SELECT * FROM diagnosis_results WHERE id = ? AND company_id = ?',
      [diagnosisId, companyId]
    );

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Diagnosis not found'
      });
    }

    res.status(200).json({
      success: true,
      diagnosis: results[0]
    });
  } catch (error) {
    console.error('Get diagnosis by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching diagnosis'
    });
  }
};
