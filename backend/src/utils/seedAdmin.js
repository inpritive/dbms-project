/**
 * Manual seed: admin user + sample data
 * Run: npm run seed (requires MONGODB_URI in .env)
 */
require('dotenv').config();
const { connectDB } = require('../config/db');
const { ensureAdminUser } = require('./ensureAdmin');
const { seedSampleData } = require('./seedData');

async function seed() {
  const connected = await connectDB();
  if (!connected) process.exit(1);

  await ensureAdminUser();
  await seedSampleData();

  console.log('✓ Seed complete');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
