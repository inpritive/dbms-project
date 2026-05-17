const mongoose = require('mongoose');
const { getStockStatus } = require('../utils/stockStatus');

const productSchema = new mongoose.Schema(
  {
    product_name: { type: String, required: true, trim: true },
    category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    supplier_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 0, default: 0 },
    stock_status: {
      type: String,
      enum: ['In Stock', 'Low Stock', 'Out of Stock'],
      default: 'In Stock',
    },
    image_url: { type: String, default: null },
  },
  { timestamps: true }
);

productSchema.pre('save', function setStockStatus(next) {
  this.stock_status = getStockStatus(this.quantity);
  next();
});

productSchema.index({ product_name: 'text' });
productSchema.index({ stock_status: 1 });

module.exports = mongoose.model('Product', productSchema);
