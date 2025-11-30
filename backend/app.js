import express from "express";
import cors from "cors";
import healthRoutes from "./api/health.js";

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

app.use(cors());
app.use(express.json());

app.use("/api/health", healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/diagnosis', diagnosisRoutes);
app.use('/api/roadmap', roadmapRoutes);
app.use('/api/risks', riskRoutes);
app.use('/api/chatbot', chatbotRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Global Error Handler
app.use(errorHandler);

export default app;
