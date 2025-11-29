// test-connection.js
const { Client } = require('pg');

// Construct the connection string from components if DATABASE_URL is not set
// This allows testing with the values we intend to use
const connectionString = process.env.DATABASE_URL ||
  `postgresql://postgres.bjexefqrufpflqemwqir:Kpaz4850@aws-0-us-west-2.pooler.supabase.com:6543/postgres`;

console.log('🔌 Testing connection to:', connectionString.replace(/:[^:]*@/, ':****@'));

const client = new Client({
  connectionString: connectionString,
  ssl: { rejectUnauthorized: false }
});

client.connect(err => {
  if (err) {
    console.error('❌ Falló la conexión:', err.message);
    process.exit(1);
  } else {
    console.log('✅ Conexión a Supabase exitosa');
    // Try a simple query
    client.query('SELECT NOW()', (err, res) => {
      if (err) {
        console.error('❌ Error en query:', err.message);
      } else {
        console.log('✅ Query exitosa. Hora del servidor:', res.rows[0].now);
      }
      client.end();
    });
  }
});
