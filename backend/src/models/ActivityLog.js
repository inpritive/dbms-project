const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    action_type: { type: String, required: true },
    entity_type: { type: String, required: true },
    entity_id: { type: String, default: null },
    description: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ActivityLog', activityLogSchema);
