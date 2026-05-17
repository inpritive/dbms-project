const express = require('express');
const router = express.Router();
const {
  getSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} = require('../controllers/supplierController');
const { authenticate } = require('../middleware/auth');
const { supplierValidation, idParam } = require('../validators');
const { asyncHandler } = require('../middleware/errorHandler');

router.use(authenticate);

router.get('/', asyncHandler(getSuppliers));
router.get('/:id', idParam, asyncHandler(getSupplierById));
router.post('/', supplierValidation, asyncHandler(createSupplier));
router.put('/:id', idParam, supplierValidation, asyncHandler(updateSupplier));
router.delete('/:id', idParam, asyncHandler(deleteSupplier));

module.exports = router;
