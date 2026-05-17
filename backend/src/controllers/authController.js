const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');
const { logActivity } = require('../middleware/activityLogger');

/** POST /api/auth/login */
const login = async (req, res) => {
  const { username, password } = req.body;

  const [users] = await pool.execute(
    `SELECT user_id, username, email, password_hash, full_name, role
     FROM users WHERE username = ? OR email = ?`,
    [username, username]
  );

  if (users.length === 0) {
    return res.status(401).json({ success: false, message: 'Invalid username or password' });
  }

  const user = users[0];
  const valid = await bcrypt.compare(password, user.password_hash);

  if (!valid) {
    return res.status(401).json({ success: false, message: 'Invalid username or password' });
  }

  const token = jwt.sign(
    { userId: user.user_id, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );

  await logActivity(user.user_id, 'LOGIN', 'user', user.user_id, `${user.username} logged in`);

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      token,
      user: {
        id: user.user_id,
        username: user.username,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
      },
    },
  });
};

/** GET /api/auth/profile */
const getProfile = async (req, res) => {
  const [users] = await pool.execute(
    `SELECT user_id, username, email, full_name, role, created_at
     FROM users WHERE user_id = ?`,
    [req.user.userId]
  );

  if (users.length === 0) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const u = users[0];
  res.json({
    success: true,
    data: {
      id: u.user_id,
      username: u.username,
      email: u.email,
      fullName: u.full_name,
      role: u.role,
      createdAt: u.created_at,
    },
  });
};

/** PUT /api/auth/profile */
const updateProfile = async (req, res) => {
  const { fullName, email } = req.body;
  const userId = req.user.userId;

  await pool.execute(
    `UPDATE users SET full_name = ?, email = ? WHERE user_id = ?`,
    [fullName, email, userId]
  );

  res.json({ success: true, message: 'Profile updated successfully' });
};

/** PUT /api/auth/change-password */
const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.userId;

  const [users] = await pool.execute(
    `SELECT password_hash FROM users WHERE user_id = ?`,
    [userId]
  );

  const valid = await bcrypt.compare(currentPassword, users[0].password_hash);
  if (!valid) {
    return res.status(400).json({ success: false, message: 'Current password is incorrect' });
  }

  const hash = await bcrypt.hash(newPassword, 10);
  await pool.execute(`UPDATE users SET password_hash = ? WHERE user_id = ?`, [hash, userId]);

  res.json({ success: true, message: 'Password changed successfully' });
};

module.exports = { login, getProfile, updateProfile, changePassword };
