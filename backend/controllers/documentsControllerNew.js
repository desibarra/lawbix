const pool = require('../database/db');
const path = require('path');
const fs = require('fs').promises;
const DocumentGenerator = require('../services/DocumentGenerator');

// @desc    Get available document templates
// @route   GET /api/documents/templates
// @access  Private
exports.getTemplates = async (req, res) => {
  try {
    const templates = [
      {
        id: 'diagnosis_report',
        name: 'Diagnóstico Legal Profesional',
        description: 'Reporte completo del diagnóstico legal de la empresa',
        type: 'pdf'
      },
      {
        id: 'compliance_report',
        name: 'Reporte de Cumplimiento',
        description: 'Análisis de cumplimiento normativo',
        type: 'pdf'
      },
      {
        id: 'risk_matrix',
        name: 'Matriz de Riesgos',
        description: 'Matriz detallada de riesgos identificados',
        type: 'pdf'
      }
    ];

    res.status(200).json({
      success: true,
      templates
    });
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching templates'
    });
  }
};

// @desc    Generate a new document (REAL PDF with Puppeteer)
// @route   POST /api/documents/generate
// @access  Private
exports.generateDocument = async (req, res) => {
  try {
    const { type, template_id } = req.body;
    const userId = req.user.id;

    console.log('\n==================== GENERATE REAL PDF ====================');
    console.log('👤 User ID:', userId);
    console.log('📄 Document Type:', type || template_id);

    // ============================================================
    // PASO 1: Obtener datos de la empresa
    // ============================================================
    console.log('\n[PASO 1] 🏢 Buscando empresa del usuario...');

    let company = null;
    try {
      const [companies] = await pool.query(
        'SELECT id, name FROM companies WHERE user_id = ? LIMIT 1',
        [userId]
      );

      if (companies.length === 0) {
        console.log('❌ No se encontró empresa registrada');
        console.log('===========================================================\n');
        return res.status(400).json({
          success: false,
          message: 'Debes registrar tu empresa primero para generar documentos'
        });
      }

      company = companies[0];
      console.log('✅ Empresa encontrada:', company.name, '(ID:', company.id, ')');
    } catch (companyError) {
      console.error('❌ Error buscando empresa:', companyError.message);
      return res.status(500).json({
        success: false,
        message: 'Error al buscar empresa',
        error: companyError.message,
        sqlMessage: companyError.sqlMessage
      });
    }

    // ============================================================
    // PASO 2: Obtener diagnóstico más reciente
    // ============================================================
    console.log('\n[PASO 2] 📊 Obteniendo diagnóstico...');

    let diagnosis = null;
    try {
      const [diagnosisResults] = await pool.query(
        'SELECT compliance_score, risk_level, answers_data FROM diagnosis_results WHERE company_id = ? ORDER BY created_at DESC LIMIT 1',
        [company.id]
      );

      if (diagnosisResults.length > 0) {
        diagnosis = diagnosisResults[0];
        console.log('✅ Diagnóstico encontrado - Score:', diagnosis.compliance_score, '%, Riesgo:', diagnosis.risk_level);
      } else {
        console.log('⚠️  No hay diagnóstico. Usando datos predeterminados.');
        diagnosis = {
          compliance_score: 0,
          risk_level: 'Medio',
          answers_data: '{}'
        };
      }
    } catch (diagnosisError) {
      console.log('⚠️  Error obteniendo diagnóstico (ignorando):', diagnosisError.message);
      diagnosis = {
        compliance_score: 0,
        risk_level: 'Medio',
        answers_data: '{}'
      };
    }

    // ============================================================
    // PASO 3: Obtener riesgos identificados
    // ============================================================
    console.log('\n[PASO 3] ⚠️  Obteniendo riesgos...');

    let risks = [];
    try {
      // Try 'risks' table first
      const [riskResults] = await pool.query(
        'SELECT category, description, level FROM risks WHERE company_id = ?',
        [company.id]
      );

      risks = riskResults;
      console.log(`✅ ${risks.length} riesgos encontrados`);
    } catch (riskError) {
      console.log('⚠️  Error obteniendo riesgos (usando fallback):', riskError.message);

      // Fallback: Try 'risk_flags' table
      try {
        const [riskFlagResults] = await pool.query(
          'SELECT tipo as category, descripcion as description, nivel as level FROM risk_flags WHERE company_id = ?',
          [company.id]
        );
        risks = riskFlagResults;
        console.log(`✅ ${risks.length} risk_flags encontrados`);
      } catch (flagError) {
        console.log('⚠️  Ninguna tabla de riesgos disponible. Usando datos mock.');
        risks = [
          { category: 'Laboral', description: 'Revisión de contratos de trabajo', level: 'Medio' },
          { category: 'Propiedad Intelectual', description: 'Registro de marca pendiente', level: 'Alto' }
        ];
      }
    }

    // ============================================================
    // PASO 4: Obtener roadmap
    // ============================================================
    console.log('\n[PASO 4] 🗺️  Obteniendo roadmap...');

    let roadmap = [];
    try {
      const [roadmapResults] = await pool.query(
        'SELECT phase, task, responsible, status FROM roadmap WHERE company_id = ? ORDER BY phase',
        [company.id]
      );

      roadmap = roadmapResults;
      console.log(`✅ ${roadmap.length} tareas encontradas en roadmap`);
    } catch (roadmapError) {
      console.log('⚠️  Error obteniendo roadmap (usando fallback):', roadmapError.message);
      roadmap = [
        { phase: 'Fase 1', task: 'Revisión legal inicial', responsible: 'Equipo Legal', status: 'Pendiente' },
        { phase: 'Fase 2', task: 'Implementación de políticas', responsible: 'RRHH', status: 'Pendiente' }
      ];
    }

    // ============================================================
    // PASO 5: Generar PDF FÍSICO con Puppeteer
    // ============================================================
    console.log('\n[PASO 5] 🎨 Generando PDF físico con diseño profesional...');

    const pdfData = {
      companyName: company.name,
      companyStage: 'Growth',
      riskLevel: diagnosis.risk_level,
      complianceScore: diagnosis.compliance_score,
      risks: risks,
      roadmap: roadmap,
      generatedAt: new Date()
    };

    let documentUrl;
    try {
      documentUrl = await DocumentGenerator.createPDF(pdfData);
      console.log('✅ PDF físico generado:', documentUrl);
    } catch (pdfError) {
      console.error('❌ Error generando PDF:', pdfError.message);
      return res.status(500).json({
        success: false,
        message: 'Error al generar el archivo PDF',
        error: pdfError.message
      });
    }

    // ============================================================
    // PASO 6: Guardar en Base de Datos
    // ============================================================
    console.log('\n[PASO 6] 💾 Guardando documento en base de datos...');

    const docType = type || template_id;
    const templateNames = {
      'diagnosis_report': 'Diagnóstico Legal Profesional',
      'compliance_report': 'Reporte de Cumplimiento',
      'risk_matrix': 'Matriz de Riesgos'
    };
    const documentName = templateNames[docType] || 'Reporte de Diagnóstico Corporativo';

    try {
      const [result] = await pool.query(
        'INSERT INTO documents (company_id, name, type, url, created_at) VALUES (?, ?, ?, ?, NOW())',
        [company.id, documentName, 'PDF', documentUrl]
      );

      console.log('✅ Documento guardado en BD - ID:', result.insertId);
      console.log('===========================================================\n');

      return res.status(201).json({
        success: true,
        message: 'PDF generado exitosamente',
        document: {
          id: result.insertId,
          name: documentName,
          type: 'PDF',
          url: documentUrl,
          company_id: company.id,
          created_at: new Date()
        }
      });

    } catch (dbError) {
      console.error('\n❌ ERROR AL GUARDAR EN BD:');
      console.error('Error Code:', dbError.code);
      console.error('SQL Message:', dbError.sqlMessage);
      console.error('===========================================================\n');

      if (dbError.code === 'ER_NO_SUCH_TABLE') {
        return res.status(500).json({
          success: false,
          message: 'La tabla "documents" no existe',
          sqlMessage: dbError.sqlMessage
        });
      }

      if (dbError.code === 'ER_BAD_FIELD_ERROR') {
        return res.status(500).json({
          success: false,
          message: 'Columna inexistente en tabla "documents"',
          sqlMessage: dbError.sqlMessage,
          hint: 'Columnas requeridas: company_id, name, type, url, created_at'
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Error al guardar documento en BD',
        sqlMessage: dbError.sqlMessage
      });
    }

  } catch (error) {
    console.error('\n❌ ERROR CRÍTICO:');
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
    console.error('===========================================================\n');

    return res.status(500).json({
      success: false,
      message: 'Error crítico al generar documento',
      error: error.message
    });
  }
};

// @desc    List user's documents
// @route   GET /api/documents
// @access  Private
exports.listDocuments = async (req, res) => {
  try {
    const userId = req.user.id;

    console.log('\n=== LIST DOCUMENTS (Flow: User -> Company -> Documents) ===');
    console.log('User ID:', userId);

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
        console.log('⚠️  User has no company. Returning empty documents.');
        console.log('===========================================================\n');
        return res.status(200).json({
          success: true,
          count: 0,
          documents: [],
          message: 'No company found. Please register your company first.'
        });
      }
    } catch (companyError) {
      console.error('⚠️  Error finding company:', companyError.message);
      return res.status(200).json({
        success: true,
        count: 0,
        documents: [],
        message: 'Error finding company.'
      });
    }

    // STEP 2: Get documents for company
    console.log('\n[PASO 2] 📄 Buscando documentos de la empresa...');
    let documents = [];

    try {
      const query = 'SELECT id, name, type, url, created_at FROM documents WHERE company_id = ? ORDER BY created_at DESC';
      console.log('Query:', query);
      console.log('Params:', [companyId]);

      const [results] = await pool.query(query, [companyId]);
      documents = results;
      console.log('✅ Encontrados', documents.length, 'documentos por company_id');
    } catch (err) {
      console.error('❌ Error buscando por company_id:', err.message);
      console.log('Intentando fallback por user_id...');

      // STEP 3: Fallback to user_id for backwards compatibility
      try {
        const fallbackQuery = 'SELECT id, name, type, url, created_at FROM documents WHERE user_id = ? ORDER BY created_at DESC';
        console.log('Query (fallback):', fallbackQuery);
        console.log('Params:', [userId]);

        const [results] = await pool.query(fallbackQuery, [userId]);
        documents = results;
        console.log('✅ Encontrados', documents.length, 'documentos por user_id (fallback)');
      } catch (fallbackErr) {
        console.error('❌ Error en fallback:', fallbackErr.message);
        documents = [];
      }
    }

    console.log('===========================================================\n');

    res.status(200).json({
      success: true,
      count: documents.length,
      documents
    });
  } catch (error) {
    console.error('\n=== ERROR LIST DOCUMENTS ===');
    console.error('Error:', error.message);
    console.error('Code:', error.code);
    console.error('SQL Message:', error.sqlMessage);
    console.error('============================\n');

    // If table doesn't exist or any DB error, return empty array instead of error
    if (error.code === 'ER_NO_SUCH_TABLE' || error.code === 'ER_BAD_DB_ERROR' || error.code === 'ER_BAD_FIELD_ERROR') {
      console.warn('⚠️  Database issue detected. Returning empty documents array.');
      return res.status(200).json({
        success: true,
        count: 0,
        documents: [],
        message: 'No documents found. Database may need setup.'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error fetching documents',
      error: error.message
    });
  }
};

// @desc    Download a document
// @route   GET /api/documents/download/:id
// @access  Private
exports.downloadDocument = async (req, res) => {
  try {
    const documentId = req.params.id;
    const userId = req.user.id;

    console.log('\n==================== DOWNLOAD DOCUMENT ====================');
    console.log('👤 User ID:', userId);
    console.log('📄 Document ID:', documentId);

    // PASO 1: Buscar empresa del usuario
    const [companies] = await pool.query(
      'SELECT id FROM companies WHERE user_id = ? LIMIT 1',
      [userId]
    );

    if (companies.length === 0) {
      console.log('❌ No company found');
      return res.status(404).json({
        success: false,
        message: 'No tienes una empresa registrada'
      });
    }

    const companyId = companies[0].id;
    console.log('✅ Company ID:', companyId);

    // PASO 2: Buscar documento
    const [documents] = await pool.query(
      'SELECT id, name, url FROM documents WHERE id = ? AND company_id = ?',
      [documentId, companyId]
    );

    if (documents.length === 0) {
      console.log('❌ Document not found');
      return res.status(404).json({
        success: false,
        message: 'Documento no encontrado'
      });
    }

    const document = documents[0];
    console.log('✅ Document found:', document.name);

    // PASO 3: Construir ruta física del archivo
    // document.url es del tipo: "/documents/reporte_1234567890.pdf"
    const fileName = path.basename(document.url);
    const filePath = path.join(__dirname, '..', 'storage', 'documents', fileName);

    console.log('📂 File path:', filePath);

    // PASO 4: Verificar si el archivo existe
    try {
      await fs.access(filePath);
      console.log('✅ File exists');
    } catch {
      console.log('❌ File not found on disk');
      return res.status(404).json({
        success: false,
        message: 'El archivo PDF no existe en el servidor'
      });
    }

    // PASO 5: Enviar archivo al navegador
    console.log('📥 Sending file to browser...');
    console.log('===========================================================\n');

    res.download(filePath, `${document.name}.pdf`, (err) => {
      if (err) {
        console.error('❌ Error sending file:', err);
        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            message: 'Error al descargar el archivo'
          });
        }
      }
    });

  } catch (error) {
    console.error('\n❌ ERROR DOWNLOADING:');
    console.error('Message:', error.message);
    console.error('===========================================================\n');

    res.status(500).json({
      success: false,
      message: 'Error al descargar documento',
      error: error.message
    });
  }
};

// @desc    Delete a document
// @route   DELETE /api/documents/:id
// @access  Private
exports.deleteDocument = async (req, res) => {
  try {
    const documentId = req.params.id;
    const companyId = req.user.company_id;

    // Get document info
    const [documents] = await pool.query(
      'SELECT * FROM documents WHERE id = ? AND company_id = ?',
      [documentId, companyId]
    );

    if (documents.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Delete from database
    await pool.query('DELETE FROM documents WHERE id = ?', [documentId]);

    // Delete file if exists
    const filePath = path.join(__dirname, '..', documents[0].file_path);
    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.log('File already deleted or not found');
    }

    res.status(200).json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting document'
    });
  }
};
