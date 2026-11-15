import { useState } from 'react';
import { Link } from 'react-router-dom';
import { View, User } from '../../data/mockData';

interface NavbarProps {
  navigate: (view: View, data?: unknown) => void;
  currentUser: User | null;
  isAdmin: boolean;
  onLogout: () => void;
}

export default function Navbar({ navigate, currentUser, isAdmin, onLogout }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <nav className="bg-navy text-cream sticky top-0 z-50 border-b border-navy-lighter">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          {isAdmin ? (
            <button
              onClick={() => navigate('admin-dashboard')}
              className="flex items-center gap-3 group"
            >
              <div className="w-8 h-8 rounded-sm bg-gold flex items-center justify-center">
                <span className="font-display text-navy font-bold text-sm">R</span>
              </div>
              <div className="hidden sm:block">
                <span className="font-display text-lg font-semibold text-cream">Resort</span>
                <span className="font-display text-lg font-semibold text-gold">Registry</span>
              </div>
            </button>
          ) : (
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-8 h-8 rounded-sm bg-gold flex items-center justify-center">
                <span className="font-display text-navy font-bold text-sm">R</span>
              </div>
              <div className="hidden sm:block">
                <span className="font-display text-lg font-semibold text-cream">Resort</span>
                <span className="font-display text-lg font-semibold text-gold">Registry</span>
              </div>
            </Link>
          )}

          {/* Desktop Nav */}
          {!isAdmin && (
            <div className="hidden md:flex items-center gap-6">
              <Link to="/" className="text-sm text-cream/80 hover:text-gold transition-colors">
                Trang Chủ
              </Link>
              <Link to="/danh-sach-nha" className="text-sm text-cream/80 hover:text-gold transition-colors">
                Danh Sách Nhà
              </Link>
              <Link to="/thue-biet-thu-nghi-duong" className="text-sm text-cream/80 hover:text-gold transition-colors">
                Khu Nghỉ Dưỡng
              </Link>
              <Link to="/blog" className="text-sm text-cream/80 hover:text-gold transition-colors">
                Blog
              </Link>
            </div>
          )}

          {isAdmin && (
            <div className="hidden md:flex items-center gap-1">
              {[
                { label: 'Dashboard', view: 'admin-dashboard' as View },
                { label: 'Nhà Ở', view: 'admin-properties' as View },
                { label: 'Người Dùng', view: 'admin-users' as View },
                { label: 'Đặt Chỗ', view: 'admin-bookings' as View },
                { label: 'Lịch Hẹn', view: 'admin-appointments' as View },
                { label: 'Phí & Cài Đặt', view: 'admin-fees' as View },
              ].map(item => (
                <button
                  key={item.view}
                  onClick={() => navigate(item.view)}
                  className="px-3 py-1.5 text-sm text-cream/80 hover:text-gold hover:bg-navy-lighter rounded transition-all"
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}

          {/* Right side */}
          <div className="flex items-center gap-3">
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-navy-lighter transition-colors"
                >
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-7 h-7 rounded-full object-cover border border-gold/40"
                  />
                  <span className="hidden sm:block text-sm text-cream/90">{currentUser.name.split(' ').slice(-1)[0]}</span>
                  <svg className="w-3 h-3 text-cream/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-navy-light rounded-lg shadow-xl border border-navy-lighter py-1 animate-fadeIn">
                    {!isAdmin && (
                      <>
                        <button
                          onClick={() => { navigate('profile'); setProfileOpen(false); }}
                          className="w-full text-left px-4 py-2 text-sm text-cream/80 hover:text-gold hover:bg-navy-lighter transition-colors"
                        >
                          Tài Khoản
                        </button>
                        <button
                          onClick={() => { navigate('history'); setProfileOpen(false); }}
                          className="w-full text-left px-4 py-2 text-sm text-cream/80 hover:text-gold hover:bg-navy-lighter transition-colors"
                        >
                          Lịch Sử Đặt Chỗ
                        </button>
                        <hr className="border-navy-lighter my-1" />
                      </>
                    )}
                    <button
                      onClick={() => { onLogout(); setProfileOpen(false); }}
                      className="w-full text-left px-4 py-2 text-sm text-error hover:bg-navy-lighter transition-colors"
                    >
                      Đăng Xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/dang-nhap"
                  className="text-sm text-cream/80 hover:text-gold transition-colors px-3 py-1.5"
                >
                  Đăng Nhập
                </Link>
                <Link
                  to="/dang-nhap"
                  className="text-sm bg-gold text-navy font-semibold px-4 py-1.5 rounded-lg hover:bg-gold-light transition-colors"
                >
                  Tạo Tài Khoản
                </Link>
              </div>
            )}

            {/* Mobile menu */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 text-cream/70 hover:text-gold"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                }
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-navy-light border-t border-navy-lighter animate-fadeIn">
          <div className="px-4 py-3 space-y-1">
            {!isAdmin ? (
              <>
                <Link
                  to="/"
                  onClick={() => setMenuOpen(false)}
                  className="block w-full text-left py-2 text-sm text-cream/80 hover:text-gold"
                >
                  Trang Chủ
                </Link>
                <Link
                  to="/danh-sach-nha"
                  onClick={() => setMenuOpen(false)}
                  className="block w-full text-left py-2 text-sm text-cream/80 hover:text-gold"
                >
                  Danh Sách Nhà
                </Link>
                <Link
                  to="/blog"
                  onClick={() => setMenuOpen(false)}
                  className="block w-full text-left py-2 text-sm text-cream/80 hover:text-gold"
                >
                  Blog
                </Link>
                {currentUser && (
                  <>
                    <button
                      onClick={() => { navigate('profile'); setMenuOpen(false); }}
                      className="block w-full text-left py-2 text-sm text-cream/80 hover:text-gold"
                    >
                      Tài Khoản
                    </button>
                    <button
                      onClick={() => { navigate('history'); setMenuOpen(false); }}
                      className="block w-full text-left py-2 text-sm text-cream/80 hover:text-gold"
                    >
                      Lịch Sử Đặt Chỗ
                    </button>
                  </>
                )}
              </>
            ) : (
              <>
                {['admin-dashboard', 'admin-properties', 'admin-users', 'admin-bookings', 'admin-appointments', 'admin-fees'].map(v => (
                  <button key={v} onClick={() => { navigate(v as View); setMenuOpen(false); }} className="block w-full text-left py-2 text-sm text-cream/80 hover:text-gold capitalize">{v.replace('admin-', '')}</button>
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
