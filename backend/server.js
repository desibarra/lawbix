require('dotenv').config();
const app = require('./app');
const pool = require('./database/db');

const PORT = process.env.PORT || 3001;

// Test database connection and start server
async function startServer() {
  try {
    // Test database connection
    const connection = await pool.getConnection();
    console.log('✅ Successfully connected to MySQL database');
    connection.release();

    // Start Express server
    app.listen(PORT, () => {
      console.log(`🚀 LAWBiX Server running on port ${PORT}`);
      console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`\n📌 Available endpoints:`);
      console.log(`   - POST   /api/auth/login`);
      console.log(`   - POST   /api/auth/register`);
      console.log(`   - GET    /api/auth/me`);
      console.log(`   - GET    /api/companies`);
      console.log(`   - GET    /api/documents`);
      console.log(`   - POST   /api/documents/generate`);
      console.log(`   - GET    /api/diagnosis/questions`);
      console.log(`   - POST   /api/diagnosis/submit`);
      console.log(`   - GET    /api/diagnosis/results`);
      console.log(`   - GET    /api/roadmap`);
      console.log(`   - GET    /api/risks`);
      console.log(`   - POST   /api/chatbot`);
      console.log(`   - GET    /api/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    console.error('\n💡 Make sure:');
    console.error('   1. MySQL is running');
    console.error('   2. Database credentials in .env are correct');
    console.error('   3. Database exists');
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

// Start the server
startServer();
