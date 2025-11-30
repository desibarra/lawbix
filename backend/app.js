const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const serverless = require('serverless-http');

// Import routes
const authRoutes = require('./routes/authRoutes');
const companyRoutes = require('./routes/companyRoutes');
const documentRoutes = require('./routes/documentRoutes');
const diagnosisRoutes = require('./routes/diagnosisRoutes');
const roadmapRoutes = require('./routes/roadmapRoutes');
const riskRoutes = require('./routes/riskRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');

// Import middlewares
const errorHandler = require('./middlewares/errorMiddleware');

const app = express();

// ===============================
// 🔐 Seguridad
// ===============================
app.use(helmet({
  crossOriginResourcePolicy: false,
}));

// ===============================
// 🌐 CORS
// ===============================
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'https://lawbix.creceseonline.com',
  'https://www.lawbix.creceseonline.com',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ===============================
// 📦 Parsers
// ===============================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ===============================
// 📄 Logging
// ===============================
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));

// ===============================
// 📁 Archivos estáticos
// ===============================
app.use('/documents', express.static('storage/documents'));

// ===============================
// 📌 API Routes
// ===============================
app.use('/api/auth', authRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/diagnosis', diagnosisRoutes);
app.use('/api/roadmap', roadmapRoutes);
app.use('/api/risks', riskRoutes);
app.use('/api/chatbot', chatbotRoutes);

// ===============================
// 🩺 Health Check
// ===============================
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'LAWBiX API',
  });
});

// ===============================
// ❌ 404 Handler
// ===============================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// ===============================
// ⚠️ Global Error Handler
// ===============================
app.use(errorHandler);

// === EXPORT PARA SERVERLESS (OBLIGATORIO PARA VERCEL)
module.exports = serverless(app);
