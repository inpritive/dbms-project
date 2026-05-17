const Product = require('../models/Product');
const Category = require('../models/Category');
const Supplier = require('../models/Supplier');
const { getStockStatus } = require('../utils/stockStatus');
const { logActivity } = require('../middleware/activityLogger');
const { formatProduct } = require('../utils/formatDoc');

function buildProductFilter(query) {
  const filter = {};

  if (query.search) {
    const term = new RegExp(query.search, 'i');
    filter.$or = [{ product_name: term }];
  }
  if (query.category_id) filter.category_id = query.category_id;
  if (query.supplier_id) filter.supplier_id = query.supplier_id;
  if (query.stock_status) filter.stock_status = query.stock_status;

  return filter;
}

const sortFieldMap = {
  product_id: '_id',
  product_name: 'product_name',
  price: 'price',
  quantity: 'quantity',
  date_added: 'createdAt',
  stock_status: 'stock_status',
};

/** GET /api/products */
const getProducts = async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
  const skip = (page - 1) * limit;
  const sortBy = sortFieldMap[req.query.sortBy] || '_id';
  const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

  let filter = buildProductFilter(req.query);

  if (req.query.search) {
    const term = req.query.search;
    const [cats, sups] = await Promise.all([
      Category.find({ category_name: new RegExp(term, 'i') }).select('_id'),
      Supplier.find({ supplier_name: new RegExp(term, 'i') }).select('_id'),
    ]);
    filter = {
      $or: [
        { product_name: new RegExp(term, 'i') },
        { category_id: { $in: cats.map((c) => c._id) } },
        { supplier_id: { $in: sups.map((s) => s._id) } },
      ],
      ...(req.query.stock_status && { stock_status: req.query.stock_status }),
      ...(req.query.category_id && { category_id: req.query.category_id }),
      ...(req.query.supplier_id && { supplier_id: req.query.supplier_id }),
    };
  }

  const [total, products] = await Promise.all([
    Product.countDocuments(filter),
    Product.find(filter)
      .populate('category_id')
      .populate('supplier_id')
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit),
  ]);

  res.json({
    success: true,
    data: {
      products: products.map((p) => formatProduct(p)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    },
  });
};

/** GET /api/products/:id */
const getProductById = async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate('category_id')
    .populate('supplier_id');

  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  res.json({ success: true, data: formatProduct(product) });
};

/** POST /api/products */
const createProduct = async (req, res) => {
  const { product_name, category_id, supplier_id, price, quantity } = req.body;
  const image_url = req.file ? `/uploads/${req.file.filename}` : null;

  const product = await Product.create({
    product_name,
    category_id,
    supplier_id,
    price: Number(price),
    quantity: Number(quantity),
    image_url,
    stock_status: getStockStatus(quantity),
  });

  await logActivity(
    req.user.userId,
    'CREATE',
    'product',
    product._id.toString(),
    `Added product: ${product_name}`
  );

  res.status(201).json({
    success: true,
    message: 'Product created successfully',
    data: { productId: product._id.toString() },
  });
};

/** PUT /api/products/:id */
const updateProduct = async (req, res) => {
  const { product_name, category_id, supplier_id, price, quantity } = req.body;
  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  product.product_name = product_name;
  product.category_id = category_id;
  product.supplier_id = supplier_id;
  product.price = Number(price);
  product.quantity = Number(quantity);
  product.stock_status = getStockStatus(quantity);
  if (req.file) product.image_url = `/uploads/${req.file.filename}`;

  await product.save();

  await logActivity(
    req.user.userId,
    'UPDATE',
    'product',
    req.params.id,
    `Updated product: ${product_name}`
  );

  res.json({ success: true, message: 'Product updated successfully' });
};

/** DELETE /api/products/:id */
const deleteProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  const name = product.product_name;
  await product.deleteOne();

  await logActivity(
    req.user.userId,
    'DELETE',
    'product',
    req.params.id,
    `Deleted product: ${name}`
  );

  res.json({ success: true, message: 'Product deleted successfully' });
};

/** GET /api/products/export/csv */
const exportCSV = async (req, res) => {
  const { Parser } = require('json2csv');
  const products = await Product.find().populate('category_id').populate('supplier_id');
  const rows = products.map((p) => formatProduct(p));

  const fields = [
    'product_id', 'product_name', 'category_name', 'supplier_name',
    'price', 'quantity', 'stock_status', 'inventory_value', 'date_added',
  ];

  const parser = new Parser({ fields });
  const csv = parser.parse(rows);

  res.header('Content-Type', 'text/csv');
  res.attachment('products-export.csv');
  res.send(csv);
};

/** GET /api/products/export/pdf */
const exportPDF = async (req, res) => {
  const PDFDocument = require('pdfkit');
  const products = await Product.find().populate('category_id').populate('supplier_id');
  const rows = products.map((p) => formatProduct(p));

  const doc = new PDFDocument({ margin: 50 });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=products-export.pdf');
  doc.pipe(res);

  doc.fontSize(20).text('Inventory Products Report', { align: 'center' });
  doc.moveDown();
  doc.fontSize(10);

  rows.forEach((p, i) => {
    doc.text(
      `${i + 1}. ${p.product_name} | ${p.category_name} | Qty: ${p.quantity} | $${p.price} | ${p.stock_status}`
    );
  });

  doc.end();
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  exportCSV,
  exportPDF,
};
