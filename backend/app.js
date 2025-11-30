import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { checkConnection } from './lib/db.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import companyRoutes from './routes/companyRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import diagnosisRoutes from './routes/diagnosisRoutes.js';
import roadmapRoutes from './routes/roadmapRoutes.js';
import riskRoutes from './routes/riskRoutes.js';
import chatbotRoutes from './routes/chatbotRoutes.js';

// Import middlewares
import errorHandler from './middlewares/errorMiddleware.js';

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
app.get('/api/health', async (req, res) => {
  try {
    await checkConnection();
    return res.status(200).json({ ok: true, message: 'Supabase OK' });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error.message,
    });
  }
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

export default app;
