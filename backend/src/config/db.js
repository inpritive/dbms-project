const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'inventory_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
});

/** Test database connection on startup */
async function testConnection() {
  try {
    const conn = await pool.getConnection();
    console.log('✓ MySQL database connected successfully');
    conn.release();
    return true;
  } catch (err) {
    console.error('✗ MySQL connection failed:', err.message);
    return false;
  }
}

module.exports = { pool, testConnection };
