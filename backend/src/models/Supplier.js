const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema(
  {
    supplier_name: { type: String, required: true, trim: true },
    contact_email: { type: String, default: '' },
    contact_phone: { type: String, default: '' },
    address: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Supplier', supplierSchema);
