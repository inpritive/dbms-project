const { pool } = require('../config/db');
const { logActivity } = require('../middleware/activityLogger');

/** GET /api/categories */
const getCategories = async (req, res) => {
  const search = req.query.search ? `%${req.query.search}%` : null;

  let query = `
    SELECT c.*, COUNT(p.product_id) AS product_count
    FROM categories c
    LEFT JOIN products p ON c.category_id = p.category_id
  `;
  const params = [];

  if (search) {
    query += ` WHERE c.category_name LIKE ? OR c.description LIKE ?`;
    params.push(search, search);
  }

  query += ` GROUP BY c.category_id ORDER BY c.category_name ASC`;

  const [categories] = await pool.execute(query, params);
  res.json({ success: true, data: categories });
};

/** GET /api/categories/:id */
const getCategoryById = async (req, res) => {
  const [categories] = await pool.execute(
    `SELECT * FROM categories WHERE category_id = ?`,
    [req.params.id]
  );

  if (categories.length === 0) {
    return res.status(404).json({ success: false, message: 'Category not found' });
  }

  res.json({ success: true, data: categories[0] });
};

/** POST /api/categories */
const createCategory = async (req, res) => {
  const { category_name, description } = req.body;

  const [result] = await pool.execute(
    `INSERT INTO categories (category_name, description) VALUES (?, ?)`,
    [category_name, description || null]
  );

  await logActivity(
    req.user.userId,
    'CREATE',
    'category',
    result.insertId,
    `Created category: ${category_name}`
  );

  res.status(201).json({
    success: true,
    message: 'Category created successfully',
    data: { categoryId: result.insertId },
  });
};

/** PUT /api/categories/:id */
const updateCategory = async (req, res) => {
  const { category_name, description } = req.body;

  const [result] = await pool.execute(
    `UPDATE categories SET category_name = ?, description = ? WHERE category_id = ?`,
    [category_name, description, req.params.id]
  );

  if (result.affectedRows === 0) {
    return res.status(404).json({ success: false, message: 'Category not found' });
  }

  await logActivity(req.user.userId, 'UPDATE', 'category', req.params.id, `Updated category: ${category_name}`);

  res.json({ success: true, message: 'Category updated successfully' });
};

/** DELETE /api/categories/:id */
const deleteCategory = async (req, res) => {
  const [products] = await pool.execute(
    `SELECT COUNT(*) AS count FROM products WHERE category_id = ?`,
    [req.params.id]
  );

  if (products[0].count > 0) {
    return res.status(400).json({
      success: false,
      message: 'Cannot delete category with associated products',
    });
  }

  const [result] = await pool.execute(
    `DELETE FROM categories WHERE category_id = ?`,
    [req.params.id]
  );

  if (result.affectedRows === 0) {
    return res.status(404).json({ success: false, message: 'Category not found' });
  }

  await logActivity(req.user.userId, 'DELETE', 'category', req.params.id, 'Deleted a category');

  res.json({ success: true, message: 'Category deleted successfully' });
};

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
