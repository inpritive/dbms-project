const express = require('express');
const router = express.Router();
const {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');
const { authenticate } = require('../middleware/auth');
const { categoryValidation, idParam } = require('../validators');
const { asyncHandler } = require('../middleware/errorHandler');

router.use(authenticate);

router.get('/', asyncHandler(getCategories));
router.get('/:id', idParam, asyncHandler(getCategoryById));
router.post('/', categoryValidation, asyncHandler(createCategory));
router.put('/:id', idParam, categoryValidation, asyncHandler(updateCategory));
router.delete('/:id', idParam, asyncHandler(deleteCategory));

module.exports = router;
