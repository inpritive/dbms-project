import { useEffect, useState, useCallback } from 'react';
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Download,
  ChevronLeft,
  ChevronRight,
  ImageIcon,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import Modal from '../components/Modal';
import StockBadge from '../components/StockBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../api/axios';

const emptyForm = {
  product_name: '',
  category_id: '',
  supplier_id: '',
  price: '',
  quantity: '',
  image: null,
};

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ category_id: '', stock_status: '' });
  const [sortBy, setSortBy] = useState('product_id');
  const [sortOrder, setSortOrder] = useState('desc');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const fetchProducts = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 10,
        search: search || undefined,
        category_id: filters.category_id || undefined,
        stock_status: filters.stock_status || undefined,
        sortBy,
        sortOrder,
      };
      const { data } = await api.get('/products', { params });
      setProducts(data.data.products);
      setPagination(data.data.pagination);
    } catch {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [search, filters, sortBy, sortOrder]);

  useEffect(() => {
    const loadMeta = async () => {
      const [catRes, supRes] = await Promise.all([
        api.get('/categories'),
        api.get('/suppliers'),
      ]);
      setCategories(catRes.data.data);
      setSuppliers(supRes.data.data);
    };
    loadMeta();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchProducts(1), 300);
    return () => clearTimeout(timer);
  }, [fetchProducts]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (product) => {
    setEditing(product);
    setForm({
      product_name: product.product_name,
      category_id: product.category_id,
      supplier_id: product.supplier_id,
      price: product.price,
      quantity: product.quantity,
      image: null,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const formData = new FormData();
    formData.append('product_name', form.product_name);
    formData.append('category_id', form.category_id);
    formData.append('supplier_id', form.supplier_id);
    formData.append('price', form.price);
    formData.append('quantity', form.quantity);
    if (form.image) formData.append('image', form.image);

    try {
      if (editing) {
        await api.put(`/products/${editing.product_id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Product updated');
      } else {
        await api.post('/products', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Product created');
      }
      setModalOpen(false);
      fetchProducts(pagination.page);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deleted');
      fetchProducts(pagination.page);
    } catch {
      toast.error('Delete failed');
    }
  };

  const handleExport = async (type) => {
    try {
      const res = await api.get(`/products/export/${type}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `products.${type}`;
      a.click();
      toast.success(`Exported as ${type.toUpperCase()}`);
    } catch {
      toast.error('Export failed');
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const imageBase = import.meta.env.VITE_API_URL?.replace('/api', '') || '';

  return (
    <Layout title="Products" subtitle="Manage your product inventory">
      {/* Toolbar */}
      <div className="card mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search products, categories, suppliers..."
              className="input-field pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="input-field lg:w-40"
            value={filters.category_id}
            onChange={(e) => setFilters({ ...filters, category_id: e.target.value })}
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.category_id} value={c.category_id}>
                {c.category_name}
              </option>
            ))}
          </select>
          <select
            className="input-field lg:w-40"
            value={filters.stock_status}
            onChange={(e) => setFilters({ ...filters, stock_status: e.target.value })}
          >
            <option value="">All Status</option>
            <option value="In Stock">In Stock</option>
            <option value="Low Stock">Low Stock</option>
            <option value="Out of Stock">Out of Stock</option>
          </select>
          <div className="flex gap-2">
            <button onClick={() => handleExport('csv')} className="btn-secondary">
              <Download size={18} /> CSV
            </button>
            <button onClick={() => handleExport('pdf')} className="btn-secondary">
              <Download size={18} /> PDF
            </button>
            <button onClick={openCreate} className="btn-primary">
              <Plus size={18} /> Add Product
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden p-0">
        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  {[
                    ['product_id', 'ID'],
                    ['product_name', 'Name'],
                    [null, 'Image'],
                    [null, 'Category'],
                    [null, 'Supplier'],
                    ['price', 'Price'],
                    ['quantity', 'Qty'],
                    [null, 'Status'],
                    ['date_added', 'Added'],
                    [null, 'Actions'],
                  ].map(([field, label], i) => (
                    <th
                      key={i}
                      className={`px-4 py-3 text-left font-medium text-gray-500 ${field ? 'cursor-pointer hover:text-gray-700' : ''}`}
                      onClick={() => field && handleSort(field)}
                    >
                      {label}
                      {field && sortBy === field && (sortOrder === 'asc' ? ' ↑' : ' ↓')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {products.map((p) => (
                  <tr key={p.product_id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                    <td className="px-4 py-3 font-mono text-xs">#{p.product_id}</td>
                    <td className="px-4 py-3 font-medium">{p.product_name}</td>
                    <td className="px-4 py-3">
                      {p.image_url ? (
                        <img
                          src={`${imageBase}${p.image_url}`}
                          alt=""
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                          <ImageIcon size={16} className="text-gray-400" />
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">{p.category_name}</td>
                    <td className="px-4 py-3">{p.supplier_name}</td>
                    <td className="px-4 py-3">${Number(p.price).toFixed(2)}</td>
                    <td className="px-4 py-3">{p.quantity}</td>
                    <td className="px-4 py-3">
                      <StockBadge status={p.stock_status} />
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {new Date(p.date_added).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button
                          onClick={() => openEdit(p)}
                          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-brand-600"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(p.product_id)}
                          className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-800">
          <p className="text-sm text-gray-500">
            Showing {products.length} of {pagination.total} products
          </p>
          <div className="flex gap-2">
            <button
              disabled={pagination.page <= 1}
              onClick={() => fetchProducts(pagination.page - 1)}
              className="btn-secondary p-2"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="px-3 py-2 text-sm">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => fetchProducts(pagination.page + 1)}
              className="btn-secondary p-2"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Product' : 'Add Product'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Product Name</label>
            <input
              className="input-field"
              value={form.product_name}
              onChange={(e) => setForm({ ...form, product_name: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                className="input-field"
                value={form.category_id}
                onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                required
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.category_id} value={c.category_id}>
                    {c.category_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Supplier</label>
              <select
                className="input-field"
                value={form.supplier_id}
                onChange={(e) => setForm({ ...form, supplier_id: e.target.value })}
                required
              >
                <option value="">Select supplier</option>
                {suppliers.map((s) => (
                  <option key={s.supplier_id} value={s.supplier_id}>
                    {s.supplier_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Price ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="input-field"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Quantity</label>
              <input
                type="number"
                min="0"
                className="input-field"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Product Image</label>
            <input
              type="file"
              accept="image/*"
              className="input-field"
              onChange={(e) => setForm({ ...form, image: e.target.files[0] })}
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" className="btn-primary flex-1" disabled={submitting}>
              {submitting ? 'Saving...' : editing ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
}
