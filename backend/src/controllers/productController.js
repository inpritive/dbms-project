const { pool } = require('../config/db');
const { getStockStatus } = require('../utils/stockStatus');
const { logActivity } = require('../middleware/activityLogger');

/** Build WHERE clause for search/filter */
function buildProductFilters(query) {
  const conditions = [];
  const params = [];

  if (query.search) {
    conditions.push(`(p.product_name LIKE ? OR c.category_name LIKE ? OR s.supplier_name LIKE ?)`);
    const term = `%${query.search}%`;
    params.push(term, term, term);
  }
  if (query.category_id) {
    conditions.push('p.category_id = ?');
    params.push(query.category_id);
  }
  if (query.supplier_id) {
    conditions.push('p.supplier_id = ?');
    params.push(query.supplier_id);
  }
  if (query.stock_status) {
    conditions.push('p.stock_status = ?');
    params.push(query.stock_status);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  return { where, params };
}

/** GET /api/products */
const getProducts = async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
  const offset = (page - 1) * limit;
  const sortBy = ['product_name', 'price', 'quantity', 'date_added', 'stock_status'].includes(req.query.sortBy)
    ? req.query.sortBy
    : 'product_id';
  const sortOrder = req.query.sortOrder === 'asc' ? 'ASC' : 'DESC';

  const { where, params } = buildProductFilters(req.query);

  const [countResult] = await pool.execute(
    `SELECT COUNT(*) AS total FROM products p
     INNER JOIN categories c ON p.category_id = c.category_id
     INNER JOIN suppliers s ON p.supplier_id = s.supplier_id
     ${where}`,
    params
  );

  const [products] = await pool.execute(
    `SELECT p.product_id, p.product_name, p.category_id, c.category_name,
            p.supplier_id, s.supplier_name, p.price, p.quantity,
            p.stock_status, p.image_url, p.date_added,
            (p.price * p.quantity) AS inventory_value
     FROM products p
     INNER JOIN categories c ON p.category_id = c.category_id
     INNER JOIN suppliers s ON p.supplier_id = s.supplier_id
     ${where}
     ORDER BY p.${sortBy} ${sortOrder}
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  res.json({
    success: true,
    data: {
      products,
      pagination: {
        page,
        limit,
        total: countResult[0].total,
        totalPages: Math.ceil(countResult[0].total / limit),
      },
    },
  });
};

/** GET /api/products/:id */
const getProductById = async (req, res) => {
  const [products] = await pool.execute(
    `SELECT * FROM vw_product_details WHERE product_id = ?`,
    [req.params.id]
  );

  if (products.length === 0) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  res.json({ success: true, data: products[0] });
};

/** POST /api/products */
const createProduct = async (req, res) => {
  const { product_name, category_id, supplier_id, price, quantity } = req.body;
  const image_url = req.file ? `/uploads/${req.file.filename}` : null;
  const stock_status = getStockStatus(quantity);

  const [result] = await pool.execute(
    `INSERT INTO products (product_name, category_id, supplier_id, price, quantity, image_url, stock_status)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [product_name, category_id, supplier_id, price, quantity, image_url, stock_status]
  );

  await logActivity(
    req.user.userId,
    'CREATE',
    'product',
    result.insertId,
    `Added product: ${product_name}`
  );

  res.status(201).json({
    success: true,
    message: 'Product created successfully',
    data: { productId: result.insertId },
  });
};

/** PUT /api/products/:id */
const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { product_name, category_id, supplier_id, price, quantity } = req.body;

  const [existing] = await pool.execute(`SELECT * FROM products WHERE product_id = ?`, [id]);
  if (existing.length === 0) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  const stock_status = getStockStatus(quantity);
  let image_url = existing[0].image_url;

  if (req.file) {
    image_url = `/uploads/${req.file.filename}`;
  }

  await pool.execute(
    `UPDATE products SET product_name=?, category_id=?, supplier_id=?,
     price=?, quantity=?, image_url=?, stock_status=? WHERE product_id=?`,
    [product_name, category_id, supplier_id, price, quantity, image_url, stock_status, id]
  );

  await logActivity(req.user.userId, 'UPDATE', 'product', id, `Updated product: ${product_name}`);

  res.json({ success: true, message: 'Product updated successfully' });
};

/** DELETE /api/products/:id */
const deleteProduct = async (req, res) => {
  const { id } = req.params;

  const [existing] = await pool.execute(
    `SELECT product_name FROM products WHERE product_id = ?`,
    [id]
  );

  if (existing.length === 0) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  await pool.execute(`DELETE FROM products WHERE product_id = ?`, [id]);

  await logActivity(
    req.user.userId,
    'DELETE',
    'product',
    id,
    `Deleted product: ${existing[0].product_name}`
  );

  res.json({ success: true, message: 'Product deleted successfully' });
};

/** GET /api/products/export/csv */
const exportCSV = async (req, res) => {
  const { Parser } = require('json2csv');
  const [products] = await pool.execute(`SELECT * FROM vw_product_details ORDER BY product_id`);

  const fields = [
    'product_id', 'product_name', 'category_name', 'supplier_name',
    'price', 'quantity', 'stock_status', 'inventory_value', 'date_added',
  ];

  const parser = new Parser({ fields });
  const csv = parser.parse(products);

  res.header('Content-Type', 'text/csv');
  res.attachment('products-export.csv');
  res.send(csv);
};

/** GET /api/products/export/pdf */
const exportPDF = async (req, res) => {
  const PDFDocument = require('pdfkit');
  const [products] = await pool.execute(
    `SELECT product_id, product_name, category_name, supplier_name,
            price, quantity, stock_status FROM vw_product_details ORDER BY product_id`
  );

  const doc = new PDFDocument({ margin: 50 });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=products-export.pdf');
  doc.pipe(res);

  doc.fontSize(20).text('Inventory Products Report', { align: 'center' });
  doc.moveDown();
  doc.fontSize(10);

  products.forEach((p, i) => {
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
