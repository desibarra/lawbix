// Serverless health check endpoint
const { query } = require('../lib/db');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  console.log('🏥 Health check requested');
  console.log('Environment variables:', {
    DB_HOST: process.env.DB_HOST,
    DB_USER: process.env.DB_USER,
    DB_NAME: process.env.DB_NAME,
    NODE_ENV: process.env.NODE_ENV
  });

  try {
    // Test database connection
    console.log('🔍 Testing database connection...');
    await query('SELECT 1');
    console.log('✅ Database connection successful');

    return res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'LAWBiX API',
      database: 'connected',
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    console.error('❌ Health check failed:', error);
    return res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      service: 'LAWBiX API',
      database: 'disconnected',
      error: error.message
    });
  }
};
