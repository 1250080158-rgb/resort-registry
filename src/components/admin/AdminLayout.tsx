import { useState } from 'react';
import { View, User } from '../../data/mockData';

interface AdminLayoutProps {
  navigate: (view: View) => void;
  currentView: View;
  children: React.ReactNode;
  currentUser: User;
  onLogout: () => void;
}

const navItems = [
  { view: 'admin-dashboard' as View, icon: '⬛', label: 'Dashboard' },
  { view: 'admin-properties' as View, icon: '🏡', label: 'Quản Lý Nhà' },
  { view: 'admin-users' as View, icon: '👥', label: 'Người Dùng' },
  { view: 'admin-bookings' as View, icon: '📋', label: 'Đặt Chỗ' },
  { view: 'admin-appointments' as View, icon: '📅', label: 'Lịch Hẹn' },
  { view: 'admin-fees' as View, icon: '💰', label: 'Quản Lý Phí' },
  { view: 'admin-chat' as View, icon: '💬', label: 'Tin Nhắn' },
  { view: 'admin-settings' as View, icon: '⚙️', label: 'Cài Đặt' },
];

export default function AdminLayout({ navigate, currentView, children, currentUser, onLogout }: AdminLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-cream">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-navy/60 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 flex flex-col bg-navy transition-all duration-300
        ${collapsed ? 'w-16' : 'w-56'}
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className={`flex items-center gap-3 px-4 py-5 border-b border-navy-lighter shrink-0 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 rounded-lg bg-gold flex items-center justify-center shrink-0">
            <span className="font-display text-navy font-bold text-sm">R</span>
          </div>
          {!collapsed && (
            <div>
              <p className="font-display text-sm text-cream font-semibold leading-none">Resort</p>
              <p className="font-display text-sm text-gold font-semibold leading-none">Registry</p>
              <p className="text-xs text-cream/40 mt-0.5">Admin</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {navItems.map(item => (
            <button
              key={item.view}
              onClick={() => { navigate(item.view); setMobileOpen(false); }}
              title={collapsed ? item.label : undefined}
              className={`
                w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all relative
                ${currentView === item.view
                  ? 'bg-navy-lighter text-gold border-r-2 border-gold'
                  : 'text-cream/60 hover:text-cream hover:bg-navy-lighter/50'
                }
                ${collapsed ? 'justify-center' : ''}
              `}
            >
              <span className="text-base">{item.icon}</span>
              {!collapsed && item.label}
            </button>
          ))}
        </nav>

        {/* Collapse button (desktop) */}
        <button
          onClick={() => setCollapsed(c => !c)}
          className="hidden lg:flex items-center justify-center p-3 border-t border-navy-lighter text-cream/40 hover:text-gold transition-colors"
        >
          <svg className={`w-4 h-4 transition-transform ${collapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>

        {/* User info */}
        <div className={`border-t border-navy-lighter p-4 shrink-0 ${collapsed ? 'flex justify-center' : ''}`}>
          {collapsed ? (
            <img src={currentUser.avatar} alt={currentUser.name} className="w-8 h-8 rounded-full object-cover border border-gold/30" />
          ) : (
            <div className="flex items-center gap-3">
              <img src={currentUser.avatar} alt={currentUser.name} className="w-8 h-8 rounded-full object-cover border border-gold/30 shrink-0" />
              <div className="min-w-0">
                <p className="text-cream text-xs font-semibold truncate">{currentUser.name}</p>
                <p className="text-cream/40 text-xs">Admin</p>
              </div>
              <button onClick={onLogout} className="text-cream/30 hover:text-error ml-auto shrink-0" title="Đăng xuất">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b border-cream-dark px-6 py-3 flex items-center gap-4 sticky top-0 z-30 shrink-0">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden text-navy hover:text-gold"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div>
            <h1 className="font-semibold text-navy text-sm">
              {navItems.find(n => n.view === currentView)?.label || 'Admin'}
            </h1>
            <p className="text-xs text-muted">ResortRegistry Admin Panel</p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="text-xs text-muted hidden sm:block">
              {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
            <button
              onClick={() => navigate('home')}
              className="text-xs border border-cream-dark text-muted hover:text-navy hover:border-navy/30 px-3 py-1.5 rounded-lg transition-colors"
            >
              ← Trang Khách
            </button>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
