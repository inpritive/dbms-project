const bcrypt = require('bcryptjs');
const User = require('../models/User');

/** Create or repair admin user on server startup */
async function ensureAdminUser() {
  const password = 'admin123';
  const hash = await bcrypt.hash(password, 10);

  let user = await User.findOne({ username: 'admin' });

  if (!user) {
    user = await User.create({
      username: 'admin',
      email: 'admin@inventory.com',
      password_hash: hash,
      full_name: 'System Administrator',
      role: 'admin',
    });
    console.log('✓ Admin user created — username: admin, password: admin123');
    return { action: 'created' };
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    user.password_hash = hash;
    await user.save();
    console.log('✓ Admin password reset — username: admin, password: admin123');
    return { action: 'reset' };
  }

  return { action: 'exists' };
}

module.exports = { ensureAdminUser };
