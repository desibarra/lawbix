import { supabase } from '../lib/db.js';

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
export const getQuestions = async (req, res) => {
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
export const submitDiagnosis = async (req, res) => {
  try {
    const { answers } = req.body;
    const userId = req.user.id;

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: 'Answers array is required'
      });
    }

    // STEP 1: Find user's company
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (companyError && companyError.code !== 'PGRST116') { // PGRST116 is "The result contains 0 rows"
      console.error('Error finding company:', companyError);
    }

    const companyId = company ? company.id : null;

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

    const complianceScore = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

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
    if (!companyId) {
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

    const { data: result, error: insertError } = await supabase
      .from('diagnosis_results')
      .insert([
        {
          company_id: companyId,
          compliance_score: complianceScore,
          risk_level: riskLevel,
          answers_data: JSON.stringify(answers) // Supabase can handle JSONB if column is JSONB, but stringify is safe
        }
      ])
      .select()
      .single();

    if (insertError) throw insertError;

    res.status(201).json({
      success: true,
      message: 'Diagnosis submitted successfully',
      diagnosis: {
        id: result.id,
        compliance_score: complianceScore,
        risk_level: riskLevel,
        category_scores: categoryScores,
        total_questions: answers.length,
        created_at: new Date()
      }
    });

  } catch (error) {
    console.error('Error submitting diagnosis:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting diagnosis',
      error: error.message
    });
  }
};

// @desc    Get diagnosis results
// @route   GET /api/diagnosis/results
// @access  Private
export const getResults = async (req, res) => {
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
        diagnosis: null,
        results: [],
        message: 'No company found. Please register your company first.'
      });
    }

    // STEP 2: Get diagnosis results for company
    const { data: results, error: resultsError } = await supabase
      .from('diagnosis_results')
      .select('*')
      .eq('company_id', company.id)
      .order('created_at', { ascending: false })
      .limit(1);

    if (resultsError) throw resultsError;

    if (!results || results.length === 0) {
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
        diagnosis.answers_data = [];
      }
    }

    res.status(200).json({
      success: true,
      diagnosis,
      results: [diagnosis]
    });
  } catch (error) {
    console.error('Error fetching diagnosis results:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching diagnosis results',
      error: error.message
    });
  }
};

// @desc    Get specific diagnosis by ID
// @route   GET /api/diagnosis/:id
// @access  Private
export const getDiagnosisById = async (req, res) => {
  try {
    const diagnosisId = req.params.id;
    const companyId = req.user.company_id;

    const { data: diagnosis, error } = await supabase
      .from('diagnosis_results')
      .select('*')
      .eq('id', diagnosisId)
      .eq('company_id', companyId)
      .single();

    if (error || !diagnosis) {
      return res.status(404).json({
        success: false,
        message: 'Diagnosis not found'
      });
    }

    res.status(200).json({
      success: true,
      diagnosis
    });
  } catch (error) {
    console.error('Get diagnosis by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching diagnosis'
    });
  }
};
