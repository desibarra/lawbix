// Serverless function for user login
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../../lib/db');

module.exports = async (req, res) => {
  try {
    // ===== VALIDACIÓN OBLIGATORIA DE ENTORNO =====
    if (!process.env.DATABASE_URL) throw new Error("Falta DATABASE_URL");
    if (!process.env.JWT_SECRET && !process.env.NEXTAUTH_SECRET) throw new Error("Falta JWT_SECRET o NEXTAUTH_SECRET");

    // Normalizar secretos/urls
    const jwtSecret = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET;
    const frontendUrl = (process.env.FRONTEND_URL || process.env.NEXTAUTH_URL || 'https://lawbix.creceseonline.com').trim().replace(/[\r\n]/g, '');

    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', frontendUrl);
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    // DB Query
    const users = await query('SELECT * FROM users WHERE email = ?', [email]);

    if (!users || users.length === 0) return res.status(401).json({ error: 'Invalid credentials' });
    const user = users[0];

    // Password Check
    if (!user.password) throw new Error('User has no password');
    const isValid = await bcryptjs.compare(password, user.password);
    if (!isValid) return res.status(401).json({ error: 'Invalid credentials' });

    // JWT Sign
    const token = jwt.sign({ userId: user.id, email: user.email }, jwtSecret, { expiresIn: '24h' });

    // Response
    const { password: _, ...userWithoutPassword } = user;
    return res.status(200).json({ token, user: userWithoutPassword });

  } catch (error) {
    console.error("LOGIN CRASH:", error.message);
    console.error(error.stack);
    return res.status(500).json({
      error: "Error interno del servidor",
      details: error.message
    });
  }
};
