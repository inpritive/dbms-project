const { pool } = require('../config/db');
const { logActivity } = require('../middleware/activityLogger');

/** GET /api/suppliers */
const getSuppliers = async (req, res) => {
  const search = req.query.search ? `%${req.query.search}%` : null;

  let query = `
    SELECT s.*, COUNT(p.product_id) AS product_count
    FROM suppliers s
    LEFT JOIN products p ON s.supplier_id = p.supplier_id
  `;
  const params = [];

  if (search) {
    query += ` WHERE s.supplier_name LIKE ? OR s.contact_email LIKE ?`;
    params.push(search, search);
  }

  query += ` GROUP BY s.supplier_id ORDER BY s.supplier_name ASC`;

  const [suppliers] = await pool.execute(query, params);
  res.json({ success: true, data: suppliers });
};

/** GET /api/suppliers/:id */
const getSupplierById = async (req, res) => {
  const [suppliers] = await pool.execute(
    `SELECT * FROM suppliers WHERE supplier_id = ?`,
    [req.params.id]
  );

  if (suppliers.length === 0) {
    return res.status(404).json({ success: false, message: 'Supplier not found' });
  }

  res.json({ success: true, data: suppliers[0] });
};

/** POST /api/suppliers */
const createSupplier = async (req, res) => {
  const { supplier_name, contact_email, contact_phone, address } = req.body;

  const [result] = await pool.execute(
    `INSERT INTO suppliers (supplier_name, contact_email, contact_phone, address)
     VALUES (?, ?, ?, ?)`,
    [supplier_name, contact_email, contact_phone, address]
  );

  await logActivity(
    req.user.userId,
    'CREATE',
    'supplier',
    result.insertId,
    `Created supplier: ${supplier_name}`
  );

  res.status(201).json({
    success: true,
    message: 'Supplier created successfully',
    data: { supplierId: result.insertId },
  });
};

/** PUT /api/suppliers/:id */
const updateSupplier = async (req, res) => {
  const { supplier_name, contact_email, contact_phone, address } = req.body;

  const [result] = await pool.execute(
    `UPDATE suppliers SET supplier_name=?, contact_email=?, contact_phone=?, address=?
     WHERE supplier_id = ?`,
    [supplier_name, contact_email, contact_phone, address, req.params.id]
  );

  if (result.affectedRows === 0) {
    return res.status(404).json({ success: false, message: 'Supplier not found' });
  }

  await logActivity(req.user.userId, 'UPDATE', 'supplier', req.params.id, `Updated supplier: ${supplier_name}`);

  res.json({ success: true, message: 'Supplier updated successfully' });
};

/** DELETE /api/suppliers/:id */
const deleteSupplier = async (req, res) => {
  const [products] = await pool.execute(
    `SELECT COUNT(*) AS count FROM products WHERE supplier_id = ?`,
    [req.params.id]
  );

  if (products[0].count > 0) {
    return res.status(400).json({
      success: false,
      message: 'Cannot delete supplier with associated products',
    });
  }

  const [result] = await pool.execute(
    `DELETE FROM suppliers WHERE supplier_id = ?`,
    [req.params.id]
  );

  if (result.affectedRows === 0) {
    return res.status(404).json({ success: false, message: 'Supplier not found' });
  }

  await logActivity(req.user.userId, 'DELETE', 'supplier', req.params.id, 'Deleted a supplier');

  res.json({ success: true, message: 'Supplier deleted successfully' });
};

module.exports = {
  getSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
};
