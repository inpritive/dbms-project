const { pool } = require('../config/db');

/** Log user activity to activity_logs table */
async function logActivity(userId, actionType, entityType, entityId, description) {
  try {
    await pool.execute(
      `INSERT INTO activity_logs (user_id, action_type, entity_type, entity_id, description)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, actionType, entityType, entityId, description]
    );
  } catch (err) {
    console.error('Activity log failed:', err.message);
  }
}

module.exports = { logActivity };
