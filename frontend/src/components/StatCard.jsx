export default function StatCard({ title, value, icon: Icon, trend, color = 'brand' }) {
  const colors = {
    brand: 'bg-brand-50 dark:bg-brand-900/20 text-brand-600',
    emerald: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600',
    amber: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600',
    violet: 'bg-violet-50 dark:bg-violet-900/20 text-violet-600',
  };

  return (
    <div className="card animate-fade-in hover:shadow-soft-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight">{value}</p>
          {trend && (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{trend}</p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${colors[color]}`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
}
