const Supplier = require('../models/Supplier');
const Product = require('../models/Product');
const { logActivity } = require('../middleware/activityLogger');
const { formatSupplier } = require('../utils/formatDoc');

/** GET /api/suppliers */
const getSuppliers = async (req, res) => {
  const filter = {};
  if (req.query.search) {
    const term = new RegExp(req.query.search, 'i');
    filter.$or = [{ supplier_name: term }, { contact_email: term }];
  }

  const suppliers = await Supplier.find(filter).sort({ supplier_name: 1 });
  const result = await Promise.all(
    suppliers.map(async (sup) => {
      const count = await Product.countDocuments({ supplier_id: sup._id });
      return formatSupplier(sup, count);
    })
  );

  res.json({ success: true, data: result });
};

/** GET /api/suppliers/:id */
const getSupplierById = async (req, res) => {
  const supplier = await Supplier.findById(req.params.id);
  if (!supplier) {
    return res.status(404).json({ success: false, message: 'Supplier not found' });
  }
  res.json({ success: true, data: formatSupplier(supplier) });
};

/** POST /api/suppliers */
const createSupplier = async (req, res) => {
  const { supplier_name, contact_email, contact_phone, address } = req.body;
  const supplier = await Supplier.create({
    supplier_name,
    contact_email,
    contact_phone,
    address,
  });

  await logActivity(
    req.user.userId,
    'CREATE',
    'supplier',
    supplier._id.toString(),
    `Created supplier: ${supplier_name}`
  );

  res.status(201).json({
    success: true,
    message: 'Supplier created successfully',
    data: { supplierId: supplier._id.toString() },
  });
};

/** PUT /api/suppliers/:id */
const updateSupplier = async (req, res) => {
  const { supplier_name, contact_email, contact_phone, address } = req.body;
  const supplier = await Supplier.findByIdAndUpdate(
    req.params.id,
    { supplier_name, contact_email, contact_phone, address },
    { new: true, runValidators: true }
  );

  if (!supplier) {
    return res.status(404).json({ success: false, message: 'Supplier not found' });
  }

  await logActivity(
    req.user.userId,
    'UPDATE',
    'supplier',
    req.params.id,
    `Updated supplier: ${supplier_name}`
  );

  res.json({ success: true, message: 'Supplier updated successfully' });
};

/** DELETE /api/suppliers/:id */
const deleteSupplier = async (req, res) => {
  const count = await Product.countDocuments({ supplier_id: req.params.id });
  if (count > 0) {
    return res.status(400).json({
      success: false,
      message: 'Cannot delete supplier with associated products',
    });
  }

  const supplier = await Supplier.findByIdAndDelete(req.params.id);
  if (!supplier) {
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
