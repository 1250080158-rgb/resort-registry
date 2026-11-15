import { useEffect, useState } from 'react';
import { View, User } from '../../data/mockData';
import { userApi, appointmentApi, Appointment, User as ApiUser } from '../../utils/api';

const apptStatusConfig: Record<Appointment['status'], { label: string; color: string }> = {
  PENDING: { label: 'Chờ Xác Nhận', color: 'bg-warning/10 text-warning' },
  CONFIRMED: { label: 'Đã Xác Nhận', color: 'bg-success/10 text-success' },
  COMPLETED: { label: 'Hoàn Thành', color: 'bg-teal/10 text-teal' },
  CANCELLED: { label: 'Đã Hủy', color: 'bg-error/10 text-error' },
};

const formatApptDate = (iso: string) =>
  iso ? new Date(iso).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '--';

interface UserProfilePageProps {
  navigate: (view: View) => void;
  currentUser: User;
  currentUserApi: ApiUser;
  onLogout: () => void;
  onProfileSaved: (user: ApiUser) => void;
}

export default function UserProfilePage({ navigate, currentUser, currentUserApi, onLogout, onProfileSaved }: UserProfilePageProps) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: currentUser.name,
    phone: currentUser.phone,
    address: currentUser.address,
    email: currentUser.email,
  });
  const [saved, setSaved] = useState(false);

  // Lịch hẹn xem nhà của user
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [apptLoading, setApptLoading] = useState(true);

  // Đổi mật khẩu
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwMessage, setPwMessage] = useState('');
  const [pwError, setPwError] = useState('');
  const [pwSaving, setPwSaving] = useState(false);

  useEffect(() => {
    appointmentApi.getByCustomer(currentUserApi.id)
      .then(data => setAppointments(data))
      .catch(() => setAppointments([]))
      .finally(() => setApptLoading(false));
  }, [currentUserApi.id]);

  const cancelAppointment = async (id: number) => {
    if (!window.confirm(`Hủy lịch hẹn #${id}?`)) return;
    try {
      await appointmentApi.updateStatus(id, 'CANCELLED');
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'CANCELLED' as const } : a));
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Hủy lịch hẹn thất bại');
    }
  };

  const handleChangePassword = async () => {
    setPwMessage('');
    if (pwForm.newPassword.length < 6) { setPwError('Mật khẩu mới phải có ít nhất 6 ký tự'); return; }
    if (pwForm.newPassword !== pwForm.confirmPassword) { setPwError('Xác nhận mật khẩu không khớp'); return; }
    setPwSaving(true);
    setPwError('');
    try {
      await userApi.changePassword(currentUserApi.id, pwForm.currentPassword, pwForm.newPassword, pwForm.confirmPassword);
      setPwMessage('Đổi mật khẩu thành công!');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setPwMessage(''), 4000);
    } catch (e) {
      setPwError(e instanceof Error ? e.message : 'Đổi mật khẩu thất bại');
    } finally {
      setPwSaving(false);
    }
  };

  const handleSave = async () => {
    try {
      const updated = await userApi.update(currentUserApi.id, {
        ...currentUserApi,
        name: form.name,
        email: form.email,
        phone: form.phone,
        address: form.address,
      });
      onProfileSaved(updated);
      setSaved(true);
      setEditing(false);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Cập nhật thông tin thất bại');
    }
  };

  return (
    <div className="min-h-screen bg-cream">
      <div className="bg-navy py-12 px-6">
        <div className="max-w-4xl mx-auto flex items-end gap-6">
          <div className="relative">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-gold/40"
            />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-success border-2 border-navy" />
          </div>
          <div>
            <p className="text-gold text-xs tracking-widest uppercase mb-1">Tài Khoản</p>
            <h1 className="font-display text-3xl text-cream font-semibold">{currentUser.name}</h1>
            <p className="text-cream/60 text-sm mt-0.5">{currentUser.email}</p>
          </div>
          <div className="ml-auto hidden sm:flex gap-3">
            <div className="text-center bg-navy-lighter px-5 py-2 rounded-xl">
              <p className="font-display text-xl text-gold font-semibold">{currentUser.totalBookings}</p>
              <p className="text-xs text-cream/60">Đặt Chỗ</p>
            </div>
            <div className="text-center bg-navy-lighter px-5 py-2 rounded-xl">
              <p className="font-display text-xl text-gold font-semibold">{currentUser.totalSpent}</p>
              <p className="text-xs text-cream/60">Triệu VNĐ</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar nav */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-cream-dark">
            {[
              { icon: '👤', label: 'Thông Tin Cá Nhân', active: true },
              { icon: '📋', label: 'Lịch Sử Đặt Chỗ', action: () => navigate('history') },
              { icon: '📅', label: 'Lịch Hẹn Xem Nhà', action: () => document.getElementById('appointments-section')?.scrollIntoView({ behavior: 'smooth' }) },
              { icon: '🔒', label: 'Bảo Mật', action: () => document.getElementById('security-section')?.scrollIntoView({ behavior: 'smooth' }) },
            ].map(item => (
              <button
                key={item.label}
                onClick={item.action}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all mb-1 ${
                  item.active ? 'bg-navy text-gold' : 'text-navy hover:bg-cream'
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </button>
            ))}
            <hr className="border-cream-dark my-2" />
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-error hover:bg-error/5 transition-all"
            >
              <span>🚪</span> Đăng Xuất
            </button>
          </div>
        </div>

        {/* Profile form */}
        <div className="lg:col-span-2 space-y-5">
          {saved && (
            <div className="bg-success/10 border border-success/20 text-success text-sm px-4 py-3 rounded-xl flex items-center gap-2 animate-fadeIn">
              <span>✓</span> Thông tin đã được cập nhật thành công!
            </div>
          )}

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-xl text-navy font-semibold">Thông Tin Cá Nhân</h2>
              <button
                onClick={() => editing ? handleSave() : setEditing(true)}
                className={`text-sm font-semibold px-4 py-2 rounded-lg transition-all ${
                  editing ? 'bg-navy text-gold hover:bg-navy-light' : 'border border-cream-dark text-navy hover:border-navy/40'
                }`}
              >
                {editing ? 'Lưu Thay Đổi' : 'Chỉnh Sửa'}
              </button>
            </div>

            <div className="space-y-4">
              {[
                { label: 'Họ Và Tên', field: 'name', type: 'text' },
                { label: 'Email', field: 'email', type: 'email' },
                { label: 'Số Điện Thoại', field: 'phone', type: 'tel' },
                { label: 'Địa Chỉ Thường Trú', field: 'address', type: 'text' },
              ].map(({ label, field, type }) => (
                <div key={field}>
                  <label className="text-xs font-semibold text-muted uppercase tracking-wide mb-1.5 block">{label}</label>
                  {editing ? (
                    <input
                      type={type}
                      value={form[field as keyof typeof form]}
                      onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                      className="w-full px-4 py-2.5 text-sm rounded-lg border border-cream-dark text-navy bg-cream focus:border-gold/50"
                    />
                  ) : (
                    <p className="text-navy font-medium px-4 py-2.5 bg-cream rounded-lg text-sm">{form[field as keyof typeof form]}</p>
                  )}
                </div>
              ))}

              <div>
                <label className="text-xs font-semibold text-muted uppercase tracking-wide mb-1.5 block">CMND / CCCD</label>
                <p className="text-navy font-medium px-4 py-2.5 bg-cream-dark rounded-lg text-sm font-mono-data">{currentUser.cmnd}</p>
                <p className="text-xs text-muted mt-1">Không thể thay đổi. Liên hệ hỗ trợ nếu cần.</p>
              </div>
            </div>
          </div>

          {/* Account details */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="font-display text-xl text-navy font-semibold mb-5">Thông Tin Tài Khoản</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { label: 'Vai Trò', val: currentUser.role === 'admin' ? 'Quản Trị Viên' : 'Người Dùng', icon: '🏷' },
                { label: 'Trạng Thái', val: currentUser.status === 'active' ? 'Đang Hoạt Động' : 'Bị Khóa', icon: '🟢' },
                { label: 'Ngày Tham Gia', val: currentUser.joinDate, icon: '📅' },
                { label: 'Đăng Nhập Cuối', val: currentUser.lastLogin, icon: '🕐' },
                { label: 'Tổng Đặt Chỗ', val: `${currentUser.totalBookings} lần`, icon: '📋' },
                { label: 'Tổng Chi Tiêu', val: `${currentUser.totalSpent} tr`, icon: '💰' },
              ].map(s => (
                <div key={s.label} className="bg-cream rounded-xl p-4">
                  <p className="text-xl mb-1">{s.icon}</p>
                  <p className="text-xs text-muted">{s.label}</p>
                  <p className="font-semibold text-navy text-sm mt-0.5">{s.val}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Appointments */}
          <div id="appointments-section" className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="font-display text-xl text-navy font-semibold mb-1">Lịch Hẹn Xem Nhà</h2>
            <p className="text-muted text-sm mb-4">Các lịch hẹn bạn đã đặt với nhân viên phụ trách</p>
            {apptLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-8 h-8 border-3 border-gold/30 border-t-gold rounded-full animate-spin" />
              </div>
            ) : appointments.length === 0 ? (
              <p className="text-muted text-sm bg-cream rounded-xl p-4">Chưa có lịch hẹn nào. Chọn một tài sản ở trang Danh Sách Nhà rồi bấm "Đặt Lịch Xem Nhà".</p>
            ) : (
              <div className="space-y-3">
                {appointments.map(a => (
                  <div key={a.id} className="flex items-start gap-4 bg-cream rounded-xl p-4">
                    <span className="text-2xl">📅</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-navy text-sm font-semibold">{formatApptDate(a.appointmentDate)}</p>
                      <p className="text-muted text-xs line-clamp-1">{a.reason}</p>
                      <p className="text-muted text-xs mt-0.5">Nhân viên: {a.staffName}</p>
                    </div>
                    <div className="text-right shrink-0 flex flex-col items-end gap-2">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${apptStatusConfig[a.status].color}`}>
                        {apptStatusConfig[a.status].label}
                      </span>
                      {(a.status === 'PENDING' || a.status === 'CONFIRMED') && (
                        <button onClick={() => cancelAppointment(a.id)} className="text-xs text-error border border-error/30 px-2.5 py-1 rounded-lg hover:bg-error/5 transition-all">
                          Hủy Hẹn
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Security — đổi mật khẩu */}
          <div id="security-section" className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="font-display text-xl text-navy font-semibold mb-1">Bảo Mật</h2>
            <p className="text-muted text-sm mb-4">Đổi mật khẩu đăng nhập của bạn</p>

            {pwMessage && (
              <div className="mb-4 bg-success/10 border border-success/20 text-success text-sm px-4 py-3 rounded-xl flex items-center gap-2">
                <span>✓</span> {pwMessage}
              </div>
            )}
            {pwError && (
              <div className="mb-4 bg-error/10 border border-error/20 text-error text-sm px-4 py-3 rounded-xl">
                {pwError}
              </div>
            )}

            <div className="space-y-4 max-w-md">
              <div>
                <label className="text-xs font-semibold text-muted uppercase tracking-wide mb-1.5 block">Mật Khẩu Hiện Tại</label>
                <input
                  type="password"
                  value={pwForm.currentPassword}
                  onChange={e => setPwForm(f => ({ ...f, currentPassword: e.target.value }))}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 text-sm rounded-lg border border-cream-dark text-navy bg-cream focus:border-gold/50"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted uppercase tracking-wide mb-1.5 block">Mật Khẩu Mới</label>
                <input
                  type="password"
                  value={pwForm.newPassword}
                  onChange={e => setPwForm(f => ({ ...f, newPassword: e.target.value }))}
                  placeholder="Ít nhất 6 ký tự"
                  className="w-full px-4 py-2.5 text-sm rounded-lg border border-cream-dark text-navy bg-cream focus:border-gold/50"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted uppercase tracking-wide mb-1.5 block">Nhập Lại Mật Khẩu Mới</label>
                <input
                  type="password"
                  value={pwForm.confirmPassword}
                  onChange={e => setPwForm(f => ({ ...f, confirmPassword: e.target.value }))}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 text-sm rounded-lg border border-cream-dark text-navy bg-cream focus:border-gold/50"
                />
              </div>
              <button
                onClick={handleChangePassword}
                disabled={pwSaving}
                className="bg-navy text-gold text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-navy-light transition-colors disabled:opacity-60"
              >
                {pwSaving ? 'Đang Lưu...' : 'Đổi Mật Khẩu'}
              </button>
            </div>
          </div>

          {/* Quick actions */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="font-display text-xl text-navy font-semibold mb-4">Thao Tác Nhanh</h2>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => navigate('history')}
                className="flex items-center gap-3 p-4 bg-cream hover:bg-cream-dark rounded-xl transition-colors text-left"
              >
                <span className="text-2xl">📋</span>
                <div>
                  <p className="font-semibold text-navy text-sm">Lịch Sử Đặt Chỗ</p>
                  <p className="text-xs text-muted">{currentUser.totalBookings} đơn hàng</p>
                </div>
              </button>
              <button
                onClick={() => navigate('listings')}
                className="flex items-center gap-3 p-4 bg-cream hover:bg-cream-dark rounded-xl transition-colors text-left"
              >
                <span className="text-2xl">🏖</span>
                <div>
                  <p className="font-semibold text-navy text-sm">Tìm Nhà Mới</p>
                  <p className="text-xs text-muted">Khám phá ngay</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
