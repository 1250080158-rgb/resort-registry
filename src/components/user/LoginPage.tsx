import { useState } from 'react';
import { View } from '../../data/mockData';
import { authApi, RegisterData, User } from '../../utils/api';

interface LoginPageProps {
  navigate: (view: View) => void;
  onLogin: (user: User, token: string) => void;
}

const DEMO_USER = { email: 'tuan.nguyen@gmail.com', password: '123456' };
const DEMO_ADMIN = { email: 'admin@resortregistry.vn', password: 'admin123' };

export default function LoginPage({ navigate, onLogin }: LoginPageProps) {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [cmnd, setCmnd] = useState('');
  const [address, setAddress] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  const doLogin = async (loginEmail: string, loginPassword: string) => {
    setLoading(true);
    setFormError('');
    try {
      const { user, token } = await authApi.login(loginEmail, loginPassword);
      onLogin(user, token);
      navigate(user.role === 'ADMIN' ? 'admin-dashboard' : 'home');
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  const demoLogin = async (asAdmin: boolean) => {
    const demo = asAdmin ? DEMO_ADMIN : DEMO_USER;
    await doLogin(demo.email, demo.password);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!email) newErrors.email = 'Vui lòng nhập email';
    if (!password || password.length < 6) newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    if (tab === 'register') {
      if (!name) newErrors.name = 'Vui lòng nhập họ tên';
      if (!phone || !/^0\d{9}$/.test(phone.replace(/\s/g, ''))) newErrors.phone = 'Số điện thoại không hợp lệ (10 số, bắt đầu bằng 0)';
      if (!cmnd || cmnd.replace(/\s/g, '').length < 9) newErrors.cmnd = 'CMND/CCCD phải có ít nhất 9 chữ số';
      if (!address.trim()) newErrors.address = 'Vui lòng nhập địa chỉ';
    }
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    if (tab === 'login') {
      await doLogin(email, password);
      return;
    }

    // Đăng ký
    setLoading(true);
    setFormError('');
    try {
      const userData: RegisterData = { name, email, phone, cmnd, address, password };
      const { user, token } = await authApi.register(userData);
      onLogin(user, token);
      navigate('home');
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy flex">
      {/* Left panel - visual */}
      <div className="hidden lg:flex flex-1 relative items-end p-12">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&h=900&fit=crop&auto=format')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy/95 via-navy/60 to-navy/30" />
        <div className="relative z-10 max-w-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gold flex items-center justify-center">
              <span className="font-display text-navy font-bold">R</span>
            </div>
            <span className="font-display text-2xl">
              <span className="text-cream">Resort</span>
              <span className="text-gold">Registry</span>
            </span>
          </div>
          <h2 className="font-display text-3xl text-cream font-semibold mb-3">
            Cuộc Sống Resort<br /><span className="text-gold italic">Đẳng Cấp</span> Đang Chờ
          </h2>
          <p className="text-cream/60 text-sm leading-relaxed">
            Đăng ký ngay để khám phá hàng trăm căn nhà sang trọng tại các khu nghỉ dưỡng 5 sao trên khắp Việt Nam.
          </p>
          <div className="mt-8 flex gap-4">
            {[
              { val: '48+', label: 'Căn Nhà' },
              { val: '8', label: 'Khu Resort' },
              { val: '98%', label: 'Hài Lòng' },
            ].map(s => (
              <div key={s.label}>
                <p className="font-display text-xl text-gold font-semibold">{s.val}</p>
                <p className="text-cream/50 text-xs">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 lg:max-w-md flex items-center justify-center p-8 bg-cream">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4 lg:hidden">
              <div className="w-9 h-9 rounded-xl bg-navy flex items-center justify-center">
                <span className="font-display text-gold font-bold text-sm">R</span>
              </div>
              <span className="font-display text-xl text-navy">Resort<span className="text-gold">Registry</span></span>
            </div>
            <h1 className="font-display text-2xl text-navy font-semibold">
              {tab === 'login' ? 'Đăng Nhập' : 'Tạo Tài Khoản'}
            </h1>
            <p className="text-muted text-sm mt-1">
              {tab === 'login' ? 'Chào mừng quay lại!' : 'Bắt đầu hành trình của bạn'}
            </p>
          </div>

          {/* Tab switcher */}
          <div className="flex bg-cream-dark rounded-xl p-1 mb-6">
            {[{ val: 'login' as const, label: 'Đăng Nhập' }, { val: 'register' as const, label: 'Đăng Ký' }].map(t => (
              <button
                key={t.val}
                onClick={() => { setTab(t.val); setErrors({}); setFormError(''); }}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${tab === t.val ? 'bg-navy text-gold shadow-sm' : 'text-muted hover:text-navy'}`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {formError && (
            <div className="mb-4 p-3 rounded-xl bg-error/10 border border-error/20 text-error text-sm">
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {tab === 'register' && (
              <div>
                <label className="text-xs font-semibold text-muted uppercase tracking-wide mb-1.5 block">Họ Và Tên</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => {
                    // Chỉ cho phép chữ cái và khoảng trắng, không cho số
                    const value = e.target.value.replace(/[^a-zA-ZÀ-Ỹà-ỹ\s]/g, '');
                    setName(value);
                    setErrors(e => ({ ...e, name: '' }));
                  }}
                  placeholder="Nguyễn Văn A"
                  className={`w-full px-4 py-3 text-sm rounded-xl border bg-white text-navy ${errors.name ? 'border-error' : 'border-cream-dark'}`}
                />
                {errors.name && <p className="text-error text-xs mt-1">{errors.name}</p>}
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-muted uppercase tracking-wide mb-1.5 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setErrors(e => ({ ...e, email: '' })); }}
                placeholder="email@example.com"
                className={`w-full px-4 py-3 text-sm rounded-xl border bg-white text-navy ${errors.email ? 'border-error' : 'border-cream-dark'}`}
              />
              {errors.email && <p className="text-error text-xs mt-1">{errors.email}</p>}
            </div>

            {tab === 'register' && (
              <>
                <div>
                  <label className="text-xs font-semibold text-muted uppercase tracking-wide mb-1.5 block">Số Điện Thoại</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => { setPhone(e.target.value); setErrors(e => ({ ...e, phone: '' })); }}
                    placeholder="0912 345 678"
                    className={`w-full px-4 py-3 text-sm rounded-xl border bg-white text-navy ${errors.phone ? 'border-error' : 'border-cream-dark'}`}
                  />
                  {errors.phone && <p className="text-error text-xs mt-1">{errors.phone}</p>}
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted uppercase tracking-wide mb-1.5 block">CMND / CCCD</label>
                  <input
                    type="text"
                    value={cmnd}
                    onChange={e => { setCmnd(e.target.value); setErrors(e => ({ ...e, cmnd: '' })); }}
                    placeholder="079088012345"
                    className={`w-full px-4 py-3 text-sm rounded-xl border bg-white text-navy ${errors.cmnd ? 'border-error' : 'border-cream-dark'}`}
                  />
                  {errors.cmnd && <p className="text-error text-xs mt-1">{errors.cmnd}</p>}
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted uppercase tracking-wide mb-1.5 block">Địa Chỉ Thường Trú</label>
                  <input
                    type="text"
                    value={address}
                    onChange={e => { setAddress(e.target.value); setErrors(e => ({ ...e, address: '' })); }}
                    placeholder="Số nhà, đường, quận/huyện, tỉnh/thành"
                    className={`w-full px-4 py-3 text-sm rounded-xl border bg-white text-navy ${errors.address ? 'border-error' : 'border-cream-dark'}`}
                  />
                  {errors.address && <p className="text-error text-xs mt-1">{errors.address}</p>}
                </div>
              </>
            )}

            <div>
              <label className="text-xs font-semibold text-muted uppercase tracking-wide mb-1.5 block">Mật Khẩu</label>
              <input
                type="password"
                value={password}
                onChange={e => { setPassword(e.target.value); setErrors(e => ({ ...e, password: '' })); }}
                placeholder="••••••••"
                className={`w-full px-4 py-3 text-sm rounded-xl border bg-white text-navy ${errors.password ? 'border-error' : 'border-cream-dark'}`}
              />
              {errors.password && <p className="text-error text-xs mt-1">{errors.password}</p>}
            </div>

            {tab === 'login' && (
              <div className="text-right">
                <button onClick={() => navigate('forgot-password')} className="text-xs text-teal hover:text-navy">
                  Quên mật khẩu?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-navy text-gold font-semibold text-sm hover:bg-navy-light transition-colors shadow-lg hover:shadow-navy/20 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Đang Xử Lý...' : tab === 'login' ? 'Đăng Nhập' : 'Tạo Tài Khoản'}
            </button>
          </form>

          {/* Demo logins */}
          <div className="mt-6">
            <div className="relative">
              <hr className="border-cream-dark" />
              <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-cream px-2 text-xs text-muted">Demo nhanh</span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                onClick={() => demoLogin(false)}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-3 bg-white border border-cream-dark rounded-xl text-sm text-navy hover:border-navy/30 transition-colors disabled:opacity-60"
              >
                <span className="w-6 h-6 rounded-full bg-navy/10 flex items-center justify-center text-xs">👤</span>
                <div className="text-left">
                  <p className="font-semibold text-xs leading-none">Người Dùng</p>
                  <p className="text-muted text-xs">Demo</p>
                </div>
              </button>
              <button
                onClick={() => demoLogin(true)}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-3 bg-navy border border-navy rounded-xl text-sm hover:bg-navy-light transition-colors disabled:opacity-60"
              >
                <span className="w-6 h-6 rounded-full bg-gold/20 flex items-center justify-center text-xs">👑</span>
                <div className="text-left">
                  <p className="font-semibold text-xs text-gold leading-none">Admin</p>
                  <p className="text-cream/60 text-xs">Demo</p>
                </div>
              </button>
            </div>
            <p className="text-center text-xs text-muted mt-3">
              User: tuan.nguyen@gmail.com / 123456 · Admin: admin@resortregistry.vn / admin123
            </p>
          </div>

          <p className="text-xs text-muted text-center mt-6">
            Bằng cách tiếp tục, bạn đồng ý với{' '}
            <a href="#" className="text-teal hover:text-navy">Điều Khoản</a>{' '}
            và <a href="#" className="text-teal hover:text-navy">Chính Sách Bảo Mật</a> của chúng tôi.
          </p>
        </div>
      </div>
    </div>
  );
}
