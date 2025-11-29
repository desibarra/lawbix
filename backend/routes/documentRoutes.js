const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentsControllerNew');
const { protect } = require('../middlewares/authMiddleware');
const db = require('../database/db'); // Importamos la conexión DB

// =================================================================
// 🔓 RUTA PÚBLICA DE DEPURACIÓN (ANTES de router.use(protect))
// =================================================================
router.get('/schema', async (req, res) => {
    try {
        // Consulta directa para ver qué columnas tiene la tabla 'documents'
        const [columns] = await db.promise().query("SHOW COLUMNS FROM documents");
        res.json({ success: true, columns });
    } catch (error) {
        console.error("Error obteniendo esquema:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// =================================================================
// 🛡️ RUTAS PROTEGIDAS (Requieren Login)
// =================================================================
router.use(protect);

// Get available document templates
router.get('/templates', documentController.getTemplates);

// Generate a new document
router.post('/generate', documentController.generateDocument);

// Get user's documents
router.get('/', documentController.listDocuments);

// Download a specific document
router.get('/download/:id', documentController.downloadDocument);

// Delete a document
router.delete('/:id', documentController.deleteDocument);

module.exports = router;
