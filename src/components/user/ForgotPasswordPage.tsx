import { useState } from 'react';
import { View } from '../../data/mockData';
import { authApi } from '../../utils/api';

interface ForgotPasswordPageProps {
  navigate: (view: View) => void;
}

/**
 * Quên mật khẩu — 2 bước: (1) nhập email nhận mã, (2) nhập mã + mật khẩu mới.
 * Ở dev (backend chưa cấu hình SMTP) server trả mã trực tiếp để nhập tiếp bước 2.
 */
export default function ForgotPasswordPage({ navigate }: ForgotPasswordPageProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [info, setInfo] = useState('');
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { setFormError('Vui lòng nhập email'); return; }
    setLoading(true);
    setFormError('');
    try {
      const result = await authApi.forgotPassword(email.trim());
      setInfo(result.message);
      if (result.devToken) {
        setToken(result.devToken); // dev: điền sẵn mã để nhập tiếp
        setStep(2);
      } else {
        setStep(3); // đã gửi email hướng dẫn
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Gửi yêu cầu thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: string[] = [];
    if (!token.trim()) errors.push('Vui lòng nhập mã đặt lại mật khẩu');
    if (newPassword.length < 6) errors.push('Mật khẩu mới phải có ít nhất 6 ký tự');
    if (newPassword !== confirmPassword) errors.push('Xác nhận mật khẩu không khớp');
    if (errors.length) { setFormError(errors.join('. ')); return; }

    setLoading(true);
    setFormError('');
    try {
      const message = await authApi.resetPassword(token.trim(), newPassword);
      setInfo(message);
      setStep(3);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Đặt lại mật khẩu thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center p-6 relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&h=900&fit=crop&auto=format')` }}
      />
      <div className="relative z-10 w-full max-w-md">
        <button
          onClick={() => navigate('login')}
          className="text-cream/60 hover:text-gold text-sm mb-4 flex items-center gap-1"
        >
          ← Về Trang Đăng Nhập
        </button>

        <div className="bg-cream rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-navy flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🔑</span>
            </div>
            <h1 className="font-display text-2xl text-navy font-semibold">
              {step === 2 ? 'Mật Khẩu Mới' : 'Quên Mật Khẩu?'}
            </h1>
            <p className="text-muted text-sm mt-1">
              {step === 1 && 'Nhập email đăng ký để nhận mã đặt lại mật khẩu'}
              {step === 2 && 'Nhập mã đã nhận và mật khẩu mới cho tài khoản'}
              {step === 3 && info}
            </p>
          </div>

          {formError && (
            <div className="mb-4 p-3 rounded-xl bg-error/10 border border-error/20 text-error text-sm">
              {formError}
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleRequest} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted uppercase tracking-wide mb-1.5 block">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="w-full px-4 py-3 text-sm rounded-xl border border-cream-dark bg-white text-navy"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-navy text-gold font-semibold text-sm hover:bg-navy-light transition-colors disabled:opacity-60"
              >
                {loading ? 'Đang Xử Lý...' : 'Gửi Mã Đặt Lại Mật Khẩu'}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleReset} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted uppercase tracking-wide mb-1.5 block">Mã Đặt Lại</label>
                <input
                  type="text"
                  value={token}
                  onChange={e => setToken(e.target.value)}
                  placeholder="Mã nhận từ email"
                  className="w-full px-4 py-3 text-sm rounded-xl border border-cream-dark bg-white text-navy font-mono-data"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted uppercase tracking-wide mb-1.5 block">Mật Khẩu Mới</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 text-sm rounded-xl border border-cream-dark bg-white text-navy"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted uppercase tracking-wide mb-1.5 block">Nhập Lại Mật Khẩu</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 text-sm rounded-xl border border-cream-dark bg-white text-navy"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-navy text-gold font-semibold text-sm hover:bg-navy-light transition-colors disabled:opacity-60"
              >
                {loading ? 'Đang Xử Lý...' : 'Đặt Lại Mật Khẩu'}
              </button>
            </form>
          )}

          {step === 3 && (
            <button
              onClick={() => navigate('login')}
              className="w-full py-3.5 rounded-xl bg-navy text-gold font-semibold text-sm hover:bg-navy-light transition-colors"
            >
              Đăng Nhập Ngay
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
