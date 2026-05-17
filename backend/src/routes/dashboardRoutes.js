const express = require('express');
const router = express.Router();
const { getStats, getRecentActivity } = require('../controllers/dashboardController');
const { authenticate } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

router.use(authenticate);

router.get('/stats', asyncHandler(getStats));
router.get('/activity', asyncHandler(getRecentActivity));

module.exports = router;
