const { pool } = require('../config/db');

/** GET /api/dashboard/stats */
const getStats = async (req, res) => {
  const [summary] = await pool.execute(`SELECT * FROM vw_inventory_summary`);

  const [categoryDist] = await pool.execute(`
    SELECT c.category_name AS name, COUNT(p.product_id) AS value
    FROM categories c
    LEFT JOIN products p ON c.category_id = p.category_id
    GROUP BY c.category_id, c.category_name
    ORDER BY value DESC
  `);

  const [stockDist] = await pool.execute(`
    SELECT stock_status AS name, COUNT(*) AS value
    FROM products
    GROUP BY stock_status
  `);

  const [monthlyTrend] = await pool.execute(`
    SELECT DATE_FORMAT(date_added, '%Y-%m') AS month,
           COUNT(*) AS products_added,
           COALESCE(SUM(price * quantity), 0) AS inventory_value
    FROM products
    WHERE date_added >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
    GROUP BY DATE_FORMAT(date_added, '%Y-%m')
    ORDER BY month ASC
  `);

  const [lowStock] = await pool.execute(`
    SELECT product_id, product_name, quantity, stock_status, price
    FROM products
    WHERE stock_status IN ('Low Stock', 'Out of Stock')
    ORDER BY quantity ASC
    LIMIT 10
  `);

  const s = summary[0] || {};

  res.json({
    success: true,
    data: {
      totalProducts: Number(s.total_products) || 0,
      totalStockQuantity: Number(s.total_stock_quantity) || 0,
      totalInventoryValue: Number(s.total_inventory_value) || 0,
      lowStockCount: Number(s.low_stock_count) || 0,
      outOfStockCount: Number(s.out_of_stock_count) || 0,
      categoryDistribution: categoryDist,
      stockDistribution: stockDist,
      monthlyTrend,
      lowStockAlerts: lowStock,
    },
  });
};

/** GET /api/dashboard/activity */
const getRecentActivity = async (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 10;

  const [logs] = await pool.execute(
    `SELECT al.log_id, al.action_type, al.entity_type, al.entity_id,
            al.description, al.created_at, u.username
     FROM activity_logs al
     LEFT JOIN users u ON al.user_id = u.user_id
     ORDER BY al.created_at DESC
     LIMIT ?`,
    [limit]
  );

  res.json({ success: true, data: logs });
};

module.exports = { getStats, getRecentActivity };
