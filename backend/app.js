import express from "express";
import cors from "cors";
import helmet from 'helmet';
import morgan from 'morgan';
import authRoutes from './routes/authRoutes.js';
import companyRoutes from './routes/companyRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import diagnosisRoutes from './routes/diagnosisRoutes.js';
import roadmapRoutes from './routes/roadmapRoutes.js';
import riskRoutes from './routes/riskRoutes.js';
import chatbotRoutes from './routes/chatbotRoutes.js';
import errorHandler from './middlewares/errorMiddleware.js';

const app = express();

app.use(helmet({ crossOriginResourcePolicy: false }));

const allowedOrigins = [
  'http://localhost:5173',
  'https://lawbix.creeseonline.com',
  'https://www.lawbix.creeseonline.com'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));
app.use('/documents', express.static('storage/documents'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/diagnosis', diagnosisRoutes);
app.use('/api/roadmap', roadmapRoutes);
app.use('/api/risks', riskRoutes);
app.use('/api/chatbot', chatbotRoutes);

app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));
app.use(errorHandler);

export default app;
