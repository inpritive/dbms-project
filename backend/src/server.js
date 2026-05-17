require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { connectDB } = require('./config/db');
const { errorHandler } = require('./middleware/errorHandler');
const { ensureAdminUser } = require('./utils/ensureAdmin');
const { seedSampleData } = require('./utils/seedData');

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const supplierRoutes = require('./routes/supplierRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: (origin, callback) => {
      const allowed = [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        process.env.CLIENT_URL,
      ].filter(Boolean);
      const isAllowed =
        !origin ||
        allowed.includes(origin) ||
        origin.endsWith('.vercel.app') ||
        origin.endsWith('.onrender.com');
      callback(null, isAllowed);
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, '..', process.env.UPLOAD_DIR || 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.get('/api/health', async (req, res) => {
  const mongoose = require('mongoose');
  const User = require('./models/User');
  const mongoConnected = mongoose.connection.readyState === 1;
  let adminExists = false;
  if (mongoConnected) {
    adminExists = !!(await User.findOne({ username: 'admin' }));
  }
  res.json({
    success: mongoConnected,
    message: mongoConnected
      ? 'Inventory API is running (MongoDB)'
      : 'API running but MongoDB NOT connected — set MONGODB_URI',
    mongoConnected,
    adminExists,
    jwtConfigured: !!process.env.JWT_SECRET,
    timestamp: new Date(),
  });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use(errorHandler);

async function startServer() {
  const connected = await connectDB();
  if (connected) {
    try {
      await ensureAdminUser();
      await seedSampleData();
    } catch (err) {
      console.error('Startup seed warning:', err.message);
    }
  }
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Health: http://localhost:${PORT}/api/health`);
  });
}

startServer();
