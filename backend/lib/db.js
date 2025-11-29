// Serverless-compatible PostgreSQL connection helper for Supabase
const { Pool } = require('pg');

let pool;

function getPool() {
  if (!pool) {
    console.log('🔄 Creating PostgreSQL connection pool...');

    // Use DATABASE_URL if available (recommended for Supabase)
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      console.error('❌ DATABASE_URL environment variable is missing');
      throw new Error('DATABASE_URL environment variable is missing');
    }

    pool = new Pool({
      connectionString: connectionString,
      ssl: {
        rejectUnauthorized: false // Required for Supabase
      },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

    console.log('✅ PostgreSQL pool created');
  }

  return pool;
}

async function query(sql, params = []) {
  const pool = getPool();
  try {
    // Convert MySQL placeholders (?) to PostgreSQL ($1, $2, ...)
    let pgSql = sql;
    let pgParams = params;

    if (params.length > 0) {
      let index = 1;
      pgSql = sql.replace(/\?/g, () => `$${index++}`);
    }

    const result = await pool.query(pgSql, pgParams);
    return result.rows;
  } catch (error) {
    console.error('❌ Database query error:', error.message);
    throw error;
  }
}

module.exports = { getPool, query };
