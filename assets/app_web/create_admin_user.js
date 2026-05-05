const { createPool } = require('./backend/db');
const bcrypt = require('bcrypt');

const pool = createPool();

async function createAdminUser() {
  try {
    // Hash password (default: admin123)
    const passwordHash = await bcrypt.hash('admin123', 10);
    
    const result = await pool.query(`
      INSERT INTO admin_users (email, password_hash, is_active, created_at)
      VALUES ('admin@aramabul.com', $1, true, NOW())
      ON CONFLICT (email) DO UPDATE SET
        password_hash = EXCLUDED.password_hash,
        updated_at = NOW()
      RETURNING id, email, is_active
    `, [passwordHash]);
    
    console.log('Admin user created/updated:', result.rows[0]);
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
