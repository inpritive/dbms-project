export default function StockBadge({ status }) {
  const map = {
    'In Stock': 'badge-in-stock',
    'Low Stock': 'badge-low-stock',
    'Out of Stock': 'badge-out-stock',
  };

  return <span className={map[status] || 'badge'}>{status}</span>;
}
