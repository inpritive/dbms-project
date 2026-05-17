/**
 * Seed script - creates admin user with bcrypt hashed password
 * Run: npm run seed (after schema.sql is imported)
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');

async function seed() {
  const password = 'admin123';
  const hash = await bcrypt.hash(password, 10);

  try {
    await pool.execute(
      `UPDATE users SET password_hash = ? WHERE username = 'admin'`,
      [hash]
    );

    const [rows] = await pool.execute(`SELECT user_id FROM users WHERE username = 'admin'`);
    if (rows.length === 0) {
      await pool.execute(
        `INSERT INTO users (username, email, password_hash, full_name, role)
         VALUES ('admin', 'admin@inventory.com', ?, 'System Administrator', 'admin')`,
        [hash]
      );
    }

    console.log('✓ Admin user ready');
    console.log('  Username: admin');
    console.log('  Password: admin123');
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exit(1);
  }
}

seed();
