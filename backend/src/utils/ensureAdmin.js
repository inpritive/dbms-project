const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');

/** Create or repair admin user on server startup */
async function ensureAdminUser() {
  const password = 'admin123';
  const hash = await bcrypt.hash(password, 10);

  const [rows] = await pool.execute(
    `SELECT user_id, password_hash FROM users WHERE username = 'admin'`
  );

  if (rows.length === 0) {
    await pool.execute(
      `INSERT INTO users (username, email, password_hash, full_name, role)
       VALUES ('admin', 'admin@inventory.com', ?, 'System Administrator', 'admin')`,
      [hash]
    );
    console.log('✓ Admin user created — username: admin, password: admin123');
    return { action: 'created' };
  }

  const valid = await bcrypt.compare(password, rows[0].password_hash);
  if (!valid) {
    await pool.execute(`UPDATE users SET password_hash = ? WHERE username = 'admin'`, [hash]);
    console.log('✓ Admin password reset — username: admin, password: admin123');
    return { action: 'reset' };
  }

  return { action: 'exists' };
}

module.exports = { ensureAdminUser };
