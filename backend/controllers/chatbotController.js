const pool = require('../database/db');

// Smart keyword-based responses for legal chatbot
const SMART_RESPONSES = {
  contrato: 'Los contratos son fundamentales para formalizar relaciones comerciales. Te recomiendo revisar que todos tus contratos incluyan: objeto, obligaciones, plazo, valor y cláusulas de terminación. ¿Necesitas ayuda con algún tipo específico de contrato (laboral, comercial, confidencialidad)?',

  laboral: 'En materia laboral, es crucial: 1) Tener contratos escritos, 2) Estar al día con seguridad social, 3) Cumplir horarios y salarios mínimos, 4) Implementar SG-SST. ¿Tienes alguna duda específica sobre contratación o derechos laborales?',

  marca: 'El registro de marca te protege por 10 años renovables. Debes: 1) Verificar disponibilidad, 2) Presentar solicitud ante la autoridad competente, 3) Pagar tasas, 4) Esperar examen de forma y fondo (6-12 meses). ¿Ya verificaste si tu marca está disponible?',

  fiscal: 'Para cumplimiento fiscal recuerda: 1) Declaraciones mensuales/bimestrales según régimen, 2) Facturación electrónica obligatoria, 3) Contabilidad al día, 4) Retenciones en la fuente. ¿Estás al día con tus obligaciones tributarias?',

  datos: 'La protección de datos personales requiere: 1) Política de tratamiento publicada, 2) Registro ante autoridad (si aplica), 3) Autorización de titulares, 4) Medidas de seguridad. ¿Ya tienes tu política de privacidad?',

  empresa: 'Para constituir tu empresa necesitas: 1) Elegir tipo societario (SAS es más flexible), 2) Elaborar estatutos, 3) Registro mercantil, 4) Obtener RUT/NIT. El proceso toma 5-15 días. ¿En qué etapa estás?',

  riesgo: 'La gestión de riesgos legales incluye: identificación, evaluación (probabilidad x impacto), tratamiento y monitoreo. Te sugiero hacer un diagnóstico legal completo desde la sección "Diagnóstico". ¿Quieres que revisemos riesgos específicos?',

  cumplimiento: 'Un programa de cumplimiento (compliance) debe incluir: 1) Políticas y procedimientos, 2) Capacitación, 3) Canal de denuncias, 4) Auditorías periódicas, 5) Due diligence de terceros. ¿Ya tienes un oficial de cumplimiento?',

  propiedad: 'La propiedad intelectual abarca: marcas, patentes, derechos de autor, diseños industriales y secretos empresariales. Cada una tiene requisitos y protección diferentes. ¿Qué tipo de activo intelectual quieres proteger?',

  default: '¡Hola! Soy el asistente legal de LAWBiX. Puedo ayudarte con: contratos, cumplimiento laboral, registro de marcas, temas fiscales, protección de datos, constitución de empresas y gestión de riesgos. ¿En qué tema legal necesitas orientación?'
};

// Generate smart response based on keywords
function generateSmartResponse(message) {
  const lowerMessage = message.toLowerCase();

  // Check for keywords and return appropriate response
  for (const [keyword, response] of Object.entries(SMART_RESPONSES)) {
    if (keyword !== 'default' && lowerMessage.includes(keyword)) {
      return response;
    }
  }

  // Check for greetings
  if (lowerMessage.match(/hola|buenos|buenas|hey|saludos/)) {
    return SMART_RESPONSES.default;
  }

  // Check for help requests
  if (lowerMessage.match(/ayuda|help|asesor|necesito/)) {
    return 'Estoy aquí para asesorarte en temas legales corporativos. Puedes preguntarme sobre: contratos, derecho laboral, marcas, impuestos, protección de datos, constitución de empresas o cumplimiento normativo. ¿Qué te preocupa?';
  }

  // Check for thanks
  if (lowerMessage.match(/gracias|thanks|perfecto|excelente|ok/)) {
    return '¡Con gusto! Si tienes más dudas legales, aquí estaré para ayudarte. También puedes explorar las secciones de Diagnóstico y Documentos para un análisis más profundo. 😊';
  }

  // Default intelligent response
  return `Entiendo tu consulta sobre "${message}". Este es un tema importante que requiere análisis detallado. Te recomiendo: 1) Revisar la documentación de tu empresa, 2) Realizar el diagnóstico legal completo, 3) Consultar con un abogado especializado si es urgente. ¿Quieres que profundicemos en algún aspecto específico?`;
}

// @desc    Send message to chatbot
// @route   POST /api/chatbot
// @access  Private
exports.sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user.id;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    let botResponse;

    // Try OpenAI if API key is available
    if (process.env.OPENAI_API_KEY) {
      try {
        // OpenAI integration (requires openai package configured)
        // const openai = require('openai');
        // const completion = await openai.chat.completions.create({...});
        // botResponse = completion.choices[0].message.content;

        // For now, use smart responses even if key exists
        botResponse = generateSmartResponse(message);
      } catch (aiError) {
        console.log('OpenAI error, using smart responses:', aiError.message);
        botResponse = generateSmartResponse(message);
      }
    } else {
      // Use keyword-based smart responses
      botResponse = generateSmartResponse(message);
    }

    // Try to save to chat_history if table exists
    try {
      await pool.query(
        'INSERT INTO chat_history (user_id, message, sender, created_at) VALUES (?, ?, ?, NOW())',
        [userId, message, 'user']
      );

      await pool.query(
        'INSERT INTO chat_history (user_id, message, sender, created_at) VALUES (?, ?, ?, NOW())',
        [userId, botResponse, 'bot']
      );
    } catch (dbError) {
      if (dbError.code === 'ER_NO_SUCH_TABLE') {
        console.warn('chat_history table does not exist. Continuing without saving.');
      } else {
        console.error('Database error saving chat:', dbError);
      }
    }

    res.status(200).json({
      success: true,
      response: botResponse,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing message',
      error: error.message
    });
  }
};

// Alias for backwards compatibility
exports.processMessage = exports.sendMessage;

// @desc    Get chat history
// @route   GET /api/chatbot/history
// @access  Private
exports.getChatHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = req.query.limit || 50;

    const [messages] = await pool.query(
      'SELECT id, message, sender, created_at FROM chat_history WHERE user_id = ? ORDER BY created_at DESC LIMIT ?',
      [userId, parseInt(limit)]
    );

    res.status(200).json({
      success: true,
      count: messages.length,
      messages: messages.reverse() // Return in chronological order
    });
  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching chat history'
    });
  }
};

// @desc    Clear chat history
// @route   DELETE /api/chatbot/history
// @access  Private
exports.clearHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    await pool.query('DELETE FROM chat_history WHERE user_id = ?', [userId]);

    res.status(200).json({
      success: true,
      message: 'Chat history cleared successfully'
    });
  } catch (error) {
    console.error('Clear history error:', error);
    res.status(500).json({
      success: false,
      message: 'Error clearing chat history'
    });
  }
};
