import { useEffect, useState } from 'react';
import { Plus, Search, Pencil, Trash2, Mail, Phone, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../api/axios';

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    supplier_name: '',
    contact_email: '',
    contact_phone: '',
    address: '',
  });

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/suppliers', { params: { search: search || undefined } });
      setSuppliers(data.data);
    } catch {
      toast.error('Failed to load suppliers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchSuppliers, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/suppliers/${editing.supplier_id}`, form);
        toast.success('Supplier updated');
      } else {
        await api.post('/suppliers', form);
        toast.success('Supplier created');
      }
      setModalOpen(false);
      fetchSuppliers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this supplier?')) return;
    try {
      await api.delete(`/suppliers/${id}`);
      toast.success('Supplier deleted');
      fetchSuppliers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <Layout title="Suppliers" subtitle="Manage your product suppliers">
      <div className="card mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            className="input-field pl-10"
            placeholder="Search suppliers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button
          className="btn-primary"
          onClick={() => {
            setEditing(null);
            setForm({ supplier_name: '', contact_email: '', contact_phone: '', address: '' });
            setModalOpen(true);
          }}
        >
          <Plus size={18} /> Add Supplier
        </button>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {suppliers.map((s) => (
            <div key={s.supplier_id} className="card hover:shadow-soft-lg transition-shadow">
              <div className="flex justify-between items-start">
                <h3 className="font-semibold text-lg">{s.supplier_name}</h3>
                <span className="text-xs px-2 py-1 rounded-lg bg-violet-50 dark:bg-violet-900/20 text-violet-600">
                  {s.product_count} products
                </span>
              </div>
              <div className="mt-4 space-y-2 text-sm text-gray-500">
                {s.contact_email && (
                  <p className="flex items-center gap-2">
                    <Mail size={14} /> {s.contact_email}
                  </p>
                )}
                {s.contact_phone && (
                  <p className="flex items-center gap-2">
                    <Phone size={14} /> {s.contact_phone}
                  </p>
                )}
                {s.address && (
                  <p className="flex items-center gap-2">
                    <MapPin size={14} /> {s.address}
                  </p>
                )}
              </div>
              <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                <button
                  className="btn-secondary flex-1 text-sm"
                  onClick={() => {
                    setEditing(s);
                    setForm({
                      supplier_name: s.supplier_name,
                      contact_email: s.contact_email || '',
                      contact_phone: s.contact_phone || '',
                      address: s.address || '',
                    });
                    setModalOpen(true);
                  }}
                >
                  <Pencil size={16} /> Edit
                </button>
                <button
                  className="p-2 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  onClick={() => handleDelete(s.supplier_id)}
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
        title={editing ? 'Edit Supplier' : 'Add Supplier'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Supplier Name</label>
            <input
              className="input-field"
              value={form.supplier_name}
              onChange={(e) => setForm({ ...form, supplier_name: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                className="input-field"
                value={form.contact_email}
                onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input
                className="input-field"
                value={form.contact_phone}
                onChange={(e) => setForm({ ...form, contact_phone: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Address</label>
            <textarea
              className="input-field min-h-[80px]"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
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
