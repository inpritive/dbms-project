const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const { logActivity } = require('../middleware/activityLogger');
const { formatUser } = require('../utils/formatDoc');

/** POST /api/auth/login */
const login = async (req, res) => {
  const username = (req.body.username || '').trim();
  const password = req.body.password || '';

  // #region agent log
  fetch('http://127.0.0.1:7626/ingest/5a4d8a78-6288-47ee-a76c-e2b42b361e83',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'4e2cb1'},body:JSON.stringify({sessionId:'4e2cb1',location:'authController.js:login',message:'Login request',data:{mongoState:mongoose.connection.readyState,hasJwtSecret:!!process.env.JWT_SECRET,hasMongoUri:!!process.env.MONGODB_URI},timestamp:Date.now(),hypothesisId:'A'})}).catch(()=>{});
  // #endregion

  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message: 'Database not connected. Set MONGODB_URI on Render and redeploy.',
    });
  }

  if (!process.env.JWT_SECRET) {
    return res.status(500).json({
      success: false,
      message: 'Server misconfigured: JWT_SECRET is not set on Render.',
    });
  }

  try {
    const user = await User.findOne({
      $or: [{ username }, { email: username }],
    });

    // #region agent log
    fetch('http://127.0.0.1:7626/ingest/5a4d8a78-6288-47ee-a76c-e2b42b361e83',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'4e2cb1'},body:JSON.stringify({sessionId:'4e2cb1',location:'authController.js:login',message:'User lookup',data:{found:!!user},timestamp:Date.now(),hypothesisId:'C'})}).catch(()=>{});
    // #endregion

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
  } catch (err) {
    console.error('Login error:', err.message);
    // #region agent log
    fetch('http://127.0.0.1:7626/ingest/5a4d8a78-6288-47ee-a76c-e2b42b361e83',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'4e2cb1'},body:JSON.stringify({sessionId:'4e2cb1',location:'authController.js:login',message:'Login exception',data:{error:err.message},timestamp:Date.now(),hypothesisId:'D'})}).catch(()=>{});
    // #endregion
    res.status(500).json({ success: false, message: 'Login failed: ' + err.message });
  }
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
