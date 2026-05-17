const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  exportCSV,
  exportPDF,
} = require('../controllers/productController');
const { authenticate } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { productValidation, idParam } = require('../validators');
const { asyncHandler } = require('../middleware/errorHandler');

router.use(authenticate);

router.get('/export/csv', asyncHandler(exportCSV));
router.get('/export/pdf', asyncHandler(exportPDF));
router.get('/', asyncHandler(getProducts));
router.get('/:id', idParam, asyncHandler(getProductById));
router.post('/', upload.single('image'), productValidation, asyncHandler(createProduct));
router.put('/:id', idParam, upload.single('image'), productValidation, asyncHandler(updateProduct));
router.delete('/:id', idParam, asyncHandler(deleteProduct));

module.exports = router;
