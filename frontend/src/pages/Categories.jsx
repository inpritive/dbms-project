import { useEffect, useState } from 'react';
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../api/axios';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ category_name: '', description: '' });

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/categories', { params: { search: search || undefined } });
      setCategories(data.data);
    } catch {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchCategories, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/categories/${editing.category_id}`, form);
        toast.success('Category updated');
      } else {
        await api.post('/categories', form);
        toast.success('Category created');
      }
      setModalOpen(false);
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this category?')) return;
    try {
      await api.delete(`/categories/${id}`);
      toast.success('Category deleted');
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <Layout title="Categories" subtitle="Organize products by category">
      <div className="card mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            className="input-field pl-10"
            placeholder="Search categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button
          className="btn-primary"
          onClick={() => {
            setEditing(null);
            setForm({ category_name: '', description: '' });
            setModalOpen(true);
          }}
        >
          <Plus size={18} /> Add Category
        </button>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div key={cat.category_id} className="card hover:shadow-soft-lg transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">{cat.category_name}</h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                    {cat.description || 'No description'}
                  </p>
                </div>
                <span className="text-xs px-2 py-1 rounded-lg bg-brand-50 dark:bg-brand-900/20 text-brand-600">
                  {cat.product_count} products
                </span>
              </div>
              <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                <button
                  className="btn-secondary flex-1 text-sm"
                  onClick={() => {
                    setEditing(cat);
                    setForm({
                      category_name: cat.category_name,
                      description: cat.description || '',
                    });
                    setModalOpen(true);
                  }}
                >
                  <Pencil size={16} /> Edit
                </button>
                <button
                  className="p-2 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  onClick={() => handleDelete(cat.category_id)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Category' : 'Add Category'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Category Name</label>
            <input
              className="input-field"
              value={form.category_name}
              onChange={(e) => setForm({ ...form, category_name: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              className="input-field min-h-[100px]"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <button type="submit" className="btn-primary w-full">
            {editing ? 'Update' : 'Create'}
          </button>
        </form>
      </Modal>
    </Layout>
  );
}
