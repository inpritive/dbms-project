import { useEffect, useState } from 'react';
import {
  Package,
  Boxes,
  AlertTriangle,
  DollarSign,
  TrendingUp,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import Layout from '../components/Layout';
import StatCard from '../components/StatCard';
import StockBadge from '../components/StockBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../api/axios';

const CHART_COLORS = ['#e06356', '#8b5cf6', '#10b981', '#f59e0b', '#3b82f6', '#ec4899'];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, activityRes] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get('/dashboard/activity?limit=8'),
        ]);
        setStats(statsRes.data.data);
        setActivity(activityRes.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Layout><LoadingSpinner size="lg" /></Layout>;
  if (!stats) return <Layout><p>Failed to load dashboard</p></Layout>;

  const formatCurrency = (val) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  return (
    <Layout title="Dashboard" subtitle="Overview of your inventory performance">
      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Products"
          value={stats.totalProducts}
          icon={Package}
          color="brand"
        />
        <StatCard
          title="Total Stock Quantity"
          value={stats.totalStockQuantity.toLocaleString()}
          icon={Boxes}
          color="emerald"
        />
        <StatCard
          title="Low Stock Items"
          value={stats.lowStockCount}
          icon={AlertTriangle}
          color="amber"
          trend={`${stats.outOfStockCount} out of stock`}
        />
        <StatCard
          title="Inventory Value"
          value={formatCurrency(stats.totalInventoryValue)}
          icon={DollarSign}
          color="violet"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="card">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-brand-600" />
            Products by Category
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={stats.categoryDistribution}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  borderRadius: '12px',
                  border: 'none',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
                }}
              />
              <Bar dataKey="value" fill="#e06356" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="font-semibold mb-4">Stock Status Distribution</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={stats.stockDistribution}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {stats.stockDistribution.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Trend + Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card lg:col-span-2">
          <h3 className="font-semibold mb-4">Inventory Value Trend (6 months)</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={stats.monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(v) => formatCurrency(v)}
                contentStyle={{ borderRadius: '12px', border: 'none' }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="inventory_value"
                stroke="#e06356"
                strokeWidth={2}
                dot={{ r: 4 }}
                name="Inventory Value"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle size={18} className="text-amber-500" />
            Stock Alerts
          </h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {stats.lowStockAlerts.length === 0 ? (
              <p className="text-sm text-gray-500">All products are well stocked!</p>
            ) : (
              stats.lowStockAlerts.map((item) => (
                <div
                  key={item.product_id}
                  className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50"
                >
                  <div>
                    <p className="text-sm font-medium truncate">{item.product_name}</p>
                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <StockBadge status={item.stock_status} />
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card mt-6">
        <h3 className="font-semibold mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {activity.map((log) => (
            <div
              key={log.log_id}
              className="flex items-start gap-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            >
              <div className="w-2 h-2 mt-2 rounded-full bg-brand-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm">{log.description}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {log.username} · {new Date(log.created_at).toLocaleString()}
                </p>
              </div>
              <span className="text-xs px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 capitalize">
                {log.action_type.toLowerCase()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
