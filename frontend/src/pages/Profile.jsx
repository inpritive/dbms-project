import { useEffect, useState } from 'react';
import { User, Lock, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Profile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({ fullName: '', email: '', username: '', role: '' });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirm: '' });

  useEffect(() => {
    api.get('/auth/profile').then(({ data }) => {
      setProfile({
        fullName: data.data.fullName,
        email: data.data.email,
        username: data.data.username,
        role: data.data.role,
      });
      setLoading(false);
    });
  }, []);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put('/auth/profile', { fullName: profile.fullName, email: profile.email });
      toast.success('Profile updated');
    } catch {
      toast.error('Update failed');
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirm) {
      toast.error('Passwords do not match');
      return;
    }
    try {
      await api.put('/auth/change-password', {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      toast.success('Password changed');
      setPasswords({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password change failed');
    }
  };

  if (loading) return <Layout><LoadingSpinner /></Layout>;

  return (
    <Layout title="Profile" subtitle="Manage your account settings">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold flex items-center gap-2 mb-6">
            <User size={20} className="text-brand-600" />
            Profile Information
          </h3>
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Username</label>
              <input className="input-field bg-gray-50 dark:bg-gray-800" value={profile.username} disabled />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Full Name</label>
              <input
                className="input-field"
                value={profile.fullName}
                onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                className="input-field"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Role</label>
              <input
                className="input-field bg-gray-50 dark:bg-gray-800 capitalize"
                value={profile.role}
                disabled
              />
            </div>
            <button type="submit" className="btn-primary">
              <Save size={18} /> Save Changes
            </button>
          </form>
        </div>

        <div className="card">
          <h3 className="font-semibold flex items-center gap-2 mb-6">
            <Lock size={20} className="text-brand-600" />
            Change Password
          </h3>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Current Password</label>
              <input
                type="password"
                className="input-field"
                value={passwords.currentPassword}
                onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">New Password</label>
              <input
                type="password"
                className="input-field"
                value={passwords.newPassword}
                onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                required
                minLength={6}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Confirm Password</label>
              <input
                type="password"
                className="input-field"
                value={passwords.confirm}
                onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                required
              />
            </div>
            <button type="submit" className="btn-primary">
              <Lock size={18} /> Update Password
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}
