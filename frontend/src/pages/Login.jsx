import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Boxes, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { API_URL, isMisconfiguredProduction } from '../utils/apiConfig';
import api from '../api/axios';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState(null);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const misconfigured = isMisconfiguredProduction();

  useEffect(() => {
    if (misconfigured) return;
    api
      .get('/health')
      .then((res) => setApiStatus(res.data))
      .catch(() => setApiStatus({ success: false }));
  }, [misconfigured]);

  if (isAuthenticated) {
    navigate('/dashboard');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (misconfigured) {
      toast.error('Set VITE_API_URL on Vercel to your Render URL, then redeploy.');
      return;
    }
    if (!username || !password) {
      toast.error('Please enter username and password');
      return;
    }

    setLoading(true);
    try {
      await login(username, password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      const status = err.response?.status;

      if (!err.response) {
        toast.error(
          'Cannot reach API. Set VITE_API_URL=https://YOUR-APP.onrender.com/api on Vercel'
        );
      } else if (status === 405) {
        toast.error(
          '405: API URL points to Vercel, not Render. Set VITE_API_URL to https://YOUR-APP.onrender.com/api and redeploy.'
        );
      } else {
        toast.error(
          err.response?.data?.message ||
            `Request failed (${status}). API: ${API_URL}`
        );
      }

      // #region agent log
      fetch('http://127.0.0.1:7626/ingest/5a4d8a78-6288-47ee-a76c-e2b42b361e83',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'4e2cb1'},body:JSON.stringify({sessionId:'4e2cb1',location:'Login.jsx:handleSubmit',message:'Login error',data:{status,apiUrl:API_URL,configuredUrl:import.meta.env.VITE_API_URL||'(not set)'},timestamp:Date.now(),hypothesisId:'405'})}).catch(()=>{});
      // #endregion
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 p-12 flex-col justify-between text-white">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-white/20 backdrop-blur">
            <Boxes size={32} />
          </div>
          <span className="text-2xl font-bold">InventoryPro</span>
        </div>
        <div>
          <h1 className="text-4xl font-bold leading-tight">
            Manage your inventory with confidence
          </h1>
          <p className="mt-4 text-brand-100 text-lg">
            Real-time analytics, stock alerts, and seamless product management.
          </p>
        </div>
        <p className="text-sm text-brand-200">DBMS Mini Project © 2026</p>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50 dark:bg-surface-dark">
        <div className="w-full max-w-md animate-slide-up">
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="p-2 rounded-xl bg-brand-600 text-white">
              <Boxes size={24} />
            </div>
            <span className="text-xl font-bold">InventoryPro</span>
          </div>

          {misconfigured && (
            <div className="mb-4 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 flex gap-3">
              <AlertTriangle className="text-amber-600 shrink-0" size={22} />
              <div className="text-sm">
                <p className="font-semibold text-amber-800 dark:text-amber-300">
                  Backend URL not configured
                </p>
                <p className="mt-1 text-amber-700 dark:text-amber-400">
                  In Vercel → Settings → Environment Variables, add:
                </p>
                <code className="block mt-2 text-xs bg-white dark:bg-gray-900 p-2 rounded">
                  VITE_API_URL=https://YOUR-APP.onrender.com/api
                </code>
                <p className="mt-2 text-xs">Then redeploy Vercel.</p>
              </div>
            </div>
          )}

          {apiStatus && !misconfigured && (
            <p
              className={`mb-4 text-xs text-center ${
                apiStatus.mongoConnected ? 'text-emerald-600' : 'text-red-600'
              }`}
            >
              API: {apiStatus.mongoConnected ? 'Connected' : 'DB not connected'} · Admin:{' '}
              {apiStatus.adminExists ? 'ready' : 'missing'}
            </p>
          )}

          <div className="card">
            <h2 className="text-2xl font-bold">Sign in</h2>
            <p className="mt-1 text-gray-500 dark:text-gray-400">
              Enter your admin credentials
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label className="block text-sm font-medium mb-2">Username</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="input-field pr-12"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              <button type="submit" className="btn-primary w-full" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-500">
              Demo: <code className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">admin</code> /{' '}
              <code className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">admin123</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
