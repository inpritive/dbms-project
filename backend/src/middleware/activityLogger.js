const ActivityLog = require('../models/ActivityLog');

/** Log user activity to MongoDB */
async function logActivity(userId, actionType, entityType, entityId, description) {
  try {
    await ActivityLog.create({
      user_id: userId || null,
      action_type: actionType,
      entity_type: entityType,
      entity_id: entityId ? String(entityId) : null,
      description,
    });
  } catch (err) {
    console.error('Activity log failed:', err.message);
  }
}

module.exports = { logActivity };
