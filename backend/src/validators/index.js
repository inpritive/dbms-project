const { body, param, query } = require('express-validator');

const handleValidation = (req, res, next) => {
  const { validationResult } = require('express-validator');
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

const loginValidation = [
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidation,
];

const productValidation = [
  body('product_name').trim().notEmpty().isLength({ max: 200 }),
  body('category_id').isInt({ min: 1 }),
  body('supplier_id').isInt({ min: 1 }),
  body('price').isFloat({ min: 0 }),
  body('quantity').isInt({ min: 0 }),
  handleValidation,
];

const categoryValidation = [
  body('category_name').trim().notEmpty().isLength({ max: 100 }),
  handleValidation,
];

const supplierValidation = [
  body('supplier_name').trim().notEmpty().isLength({ max: 150 }),
  body('contact_email').optional().isEmail(),
  handleValidation,
];

const idParam = [param('id').isInt({ min: 1 }), handleValidation];

module.exports = {
  loginValidation,
  productValidation,
  categoryValidation,
  supplierValidation,
  idParam,
  handleValidation,
};
