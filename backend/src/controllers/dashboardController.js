const Product = require('../models/Product');
const Category = require('../models/Category');
const ActivityLog = require('../models/ActivityLog');
const { formatActivity } = require('../utils/formatDoc');

/** GET /api/dashboard/stats */
const getStats = async (req, res) => {
  const products = await Product.find();

  const totalProducts = products.length;
  const totalStockQuantity = products.reduce((sum, p) => sum + p.quantity, 0);
  const totalInventoryValue = products.reduce((sum, p) => sum + p.price * p.quantity, 0);
  const lowStockCount = products.filter((p) => p.stock_status === 'Low Stock').length;
  const outOfStockCount = products.filter((p) => p.stock_status === 'Out of Stock').length;

  const categories = await Category.find();
  const categoryDistribution = await Promise.all(
    categories.map(async (c) => ({
      name: c.category_name,
      value: await Product.countDocuments({ category_id: c._id }),
    }))
  );
  categoryDistribution.sort((a, b) => b.value - a.value);

  const stockStatuses = ['In Stock', 'Low Stock', 'Out of Stock'];
  const stockDistribution = stockStatuses.map((name) => ({
    name,
    value: products.filter((p) => p.stock_status === name).length,
  }));

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const recentProducts = await Product.find({ createdAt: { $gte: sixMonthsAgo } });
  const monthMap = {};
  recentProducts.forEach((p) => {
    const month = p.createdAt.toISOString().slice(0, 7);
    if (!monthMap[month]) monthMap[month] = { products_added: 0, inventory_value: 0 };
    monthMap[month].products_added += 1;
    monthMap[month].inventory_value += p.price * p.quantity;
  });
  const monthlyTrend = Object.entries(monthMap)
    .map(([month, data]) => ({ month, ...data }))
    .sort((a, b) => a.month.localeCompare(b.month));

  const lowStockAlerts = await Product.find({
    stock_status: { $in: ['Low Stock', 'Out of Stock'] },
  })
    .sort({ quantity: 1 })
    .limit(10)
    .select('product_name quantity stock_status price');

  res.json({
    success: true,
    data: {
      totalProducts,
      totalStockQuantity,
      totalInventoryValue,
      lowStockCount,
      outOfStockCount,
      categoryDistribution,
      stockDistribution,
      monthlyTrend,
      lowStockAlerts: lowStockAlerts.map((p) => ({
        product_id: p._id.toString(),
        product_name: p.product_name,
        quantity: p.quantity,
        stock_status: p.stock_status,
        price: p.price,
      })),
    },
  });
};

/** GET /api/dashboard/activity */
const getRecentActivity = async (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 10;

  const logs = await ActivityLog.find()
    .populate('user_id', 'username')
    .sort({ createdAt: -1 })
    .limit(limit);

  res.json({ success: true, data: logs.map(formatActivity) });
};

module.exports = { getStats, getRecentActivity };
