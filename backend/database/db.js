const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  max: 1, // Optimización para Serverless (evita "too many clients")
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Wrapper para compatibilidad con consultas estilo mysql2 si es necesario,
// pero idealmente deberías usar sintaxis nativa de pg ($1, $2)
module.exports = {
  query: (text, params) => pool.query(text, params),
  getConnection: async () => {
    const client = await pool.connect();
    // Monkey-patch release to match mysql2 interface if needed
    const originalRelease = client.release;
    client.release = () => originalRelease.apply(client);
    return client;
  },
  pool
};
