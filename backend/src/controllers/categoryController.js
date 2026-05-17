const Category = require('../models/Category');
const Product = require('../models/Product');
const { logActivity } = require('../middleware/activityLogger');
const { formatCategory } = require('../utils/formatDoc');

/** GET /api/categories */
const getCategories = async (req, res) => {
  const filter = {};
  if (req.query.search) {
    const term = new RegExp(req.query.search, 'i');
    filter.$or = [{ category_name: term }, { description: term }];
  }

  const categories = await Category.find(filter).sort({ category_name: 1 });
  const result = await Promise.all(
    categories.map(async (cat) => {
      const count = await Product.countDocuments({ category_id: cat._id });
      return formatCategory(cat, count);
    })
  );

  res.json({ success: true, data: result });
};

/** GET /api/categories/:id */
const getCategoryById = async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    return res.status(404).json({ success: false, message: 'Category not found' });
  }
  res.json({ success: true, data: formatCategory(category) });
};

/** POST /api/categories */
const createCategory = async (req, res) => {
  const { category_name, description } = req.body;
  const category = await Category.create({ category_name, description });

  await logActivity(
    req.user.userId,
    'CREATE',
    'category',
    category._id.toString(),
    `Created category: ${category_name}`
  );

  res.status(201).json({
    success: true,
    message: 'Category created successfully',
    data: { categoryId: category._id.toString() },
  });
};

/** PUT /api/categories/:id */
const updateCategory = async (req, res) => {
  const { category_name, description } = req.body;
  const category = await Category.findByIdAndUpdate(
    req.params.id,
    { category_name, description },
    { new: true, runValidators: true }
  );

  if (!category) {
    return res.status(404).json({ success: false, message: 'Category not found' });
  }

  await logActivity(
    req.user.userId,
    'UPDATE',
    'category',
    req.params.id,
    `Updated category: ${category_name}`
  );

  res.json({ success: true, message: 'Category updated successfully' });
};

/** DELETE /api/categories/:id */
const deleteCategory = async (req, res) => {
  const count = await Product.countDocuments({ category_id: req.params.id });
  if (count > 0) {
    return res.status(400).json({
      success: false,
      message: 'Cannot delete category with associated products',
    });
  }

  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) {
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
