const express = require('express');
const router = express.Router();
const { login, getProfile, updateProfile, changePassword } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { loginValidation } = require('../validators');
const { body } = require('express-validator');
const { handleValidation } = require('../validators');
const { asyncHandler } = require('../middleware/errorHandler');

router.post('/login', loginValidation, asyncHandler(login));
router.get('/profile', authenticate, asyncHandler(getProfile));
router.put(
  '/profile',
  authenticate,
  [body('fullName').trim().notEmpty(), body('email').isEmail(), handleValidation],
  asyncHandler(updateProfile)
);
router.put(
  '/change-password',
  authenticate,
  [
    body('currentPassword').notEmpty(),
    body('newPassword').isLength({ min: 6 }),
    handleValidation,
  ],
  asyncHandler(changePassword)
);

module.exports = router;
