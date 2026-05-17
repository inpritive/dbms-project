/** Low stock threshold - quantity at or below this is "Low Stock" */
const LOW_STOCK_THRESHOLD = 10;

/**
 * Calculate stock status based on quantity
 * @param {number} quantity
 * @returns {'In Stock'|'Low Stock'|'Out of Stock'}
 */
function getStockStatus(quantity) {
  const qty = Number(quantity);
  if (qty <= 0) return 'Out of Stock';
  if (qty <= LOW_STOCK_THRESHOLD) return 'Low Stock';
  return 'In Stock';
}

module.exports = { getStockStatus, LOW_STOCK_THRESHOLD };
