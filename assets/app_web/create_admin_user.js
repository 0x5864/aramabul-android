const { createPool } = require('./backend/db');
const crypto = require('crypto');

const pool = createPool();

function generatePasswordHash(password) {
  const safePassword = String(password || "");
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(safePassword, salt, 64).toString("hex");
  return `scrypt$${salt}$${hash}`;
}

async function createAdminUser() {
  try {
    // Hash password using the AramaBul scrypt algorithm
    const passwordHash = generatePasswordHash('admin123');
    
    const result = await pool.query(`
      INSERT INTO users (email, password_hash, display_name, role, is_active)
      VALUES ('admin@aramabul.com', $1, 'AramaBul Admin', 'admin', true)
      ON CONFLICT (email) DO UPDATE SET
        password_hash = EXCLUDED.password_hash,
        role = 'admin',
        is_active = true,
        updated_at = NOW()
      RETURNING id, email, is_active
    `, [passwordHash]);
    
    console.log('Admin user created/updated in users table:', result.rows[0]);
    console.log('Email: admin@aramabul.com');
    console.log('Password: admin123');
    console.log('Login URL: http://localhost:8787/admin-login.html');
    
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await pool.end();
  }
}

createAdminUser();
