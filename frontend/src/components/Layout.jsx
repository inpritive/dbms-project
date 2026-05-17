import Sidebar from './Sidebar';

export default function Layout({ children, title, subtitle }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 lg:ml-0 overflow-auto">
        <div className="p-6 lg:p-8 pt-16 lg:pt-8 max-w-7xl mx-auto">
          {(title || subtitle) && (
            <header className="mb-8 animate-fade-in">
              {title && <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">{title}</h1>}
              {subtitle && (
                <p className="mt-1 text-gray-500 dark:text-gray-400">{subtitle}</p>
              )}
            </header>
          )}
          {children}
        </div>
      </main>
    </div>
  );
}
