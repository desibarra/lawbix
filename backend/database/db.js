const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS, // Note: User specified DB_PASS, previous config used DB_PASSWORD. I should check .env or stick to user request. User request said DB_PASS.
  database: process.env.DB_NAME,
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
});

module.exports = pool;
