const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { logActivity } = require('../middleware/activityLogger');
const { formatUser } = require('../utils/formatDoc');

/** POST /api/auth/login */
const login = async (req, res) => {
  const username = (req.body.username || '').trim();
  const password = req.body.password || '';

  const user = await User.findOne({
    $or: [{ username }, { email: username }],
  });

  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid username or password' });
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    return res.status(401).json({ success: false, message: 'Invalid username or password' });
  }

  const token = jwt.sign(
    { userId: user._id.toString(), username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );

  await logActivity(user._id, 'LOGIN', 'user', user._id.toString(), `${user.username} logged in`);

  const formatted = formatUser(user);
  res.json({
    success: true,
    message: 'Login successful',
    data: {
      token,
      user: {
        id: formatted.id,
        username: formatted.username,
        email: formatted.email,
        fullName: formatted.fullName,
        role: formatted.role,
      },
    },
  });
};

/** GET /api/auth/profile */
const getProfile = async (req, res) => {
  const user = await User.findById(req.user.userId);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  const formatted = formatUser(user);
  res.json({ success: true, data: formatted });
};

/** PUT /api/auth/profile */
const updateProfile = async (req, res) => {
  const { fullName, email } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user.userId,
    { full_name: fullName, email },
    { new: true, runValidators: true }
  );
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  res.json({ success: true, message: 'Profile updated successfully' });
};

/** PUT /api/auth/change-password */
const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user.userId);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const valid = await bcrypt.compare(currentPassword, user.password_hash);
  if (!valid) {
    return res.status(400).json({ success: false, message: 'Current password is incorrect' });
  }

  user.password_hash = await bcrypt.hash(newPassword, 10);
  await user.save();
  res.json({ success: true, message: 'Password changed successfully' });
};

module.exports = { login, getProfile, updateProfile, changePassword };
