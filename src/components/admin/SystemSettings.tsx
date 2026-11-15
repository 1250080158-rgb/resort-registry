import { useEffect, useState } from 'react';
import { settingApi } from '../../utils/api';

// Chuyển giá trị lưu dạng chuỗi về boolean ("true"/"false")
const asBool = (v: string | undefined, fallback: boolean) => v === undefined ? fallback : v === 'true';

export default function SystemSettings() {
  const [saved, setSaved] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [website, setWebsite] = useState({
    name: 'ResortRegistry',
    tagline: 'Nền tảng đăng ký nhà ở khu nghỉ dưỡng hàng đầu Việt Nam',
    email: 'support@resortregistry.vn',
    phone: '1800 8888',
    address: '12 Phố Huế, Hai Bà Trưng, Hà Nội',
    facebook: 'https://facebook.com/resortregistry',
    instagram: 'https://instagram.com/resortregistry',
  });
  const [payment, setPayment] = useState({
    stripePublic: 'pk_test_51...XXX',
    stripeSecret: '••••••••••••••••••••',
    mode: 'test',
    currency: 'VND',
    minDeposit: '1',
    processingFeeRate: '5',
  });
  const [security, setSecurity] = useState({
    sessionTimeout: '60',
    maxLoginAttempts: '5',
    twoFactor: false,
    ipWhitelist: false,
    passwordMinLength: '8',
    autoLogout: true,
  });
  const [notifications, setNotifications] = useState({
    emailNewBooking: true,
    emailCancellation: true,
    emailPayment: true,
    smsNewBooking: false,
    smsPayment: true,
    adminDailyReport: true,
  });

  // Nạp cấu hình đã lưu từ server; giữ giá trị mặc định nếu backend chưa chạy
  useEffect(() => {
    settingApi.getAll()
      .then(map => {
        setWebsite(prev => ({
          name: map['website.name'] ?? prev.name,
          tagline: map['website.tagline'] ?? prev.tagline,
          email: map['website.email'] ?? prev.email,
          phone: map['website.phone'] ?? prev.phone,
          address: map['website.address'] ?? prev.address,
          facebook: map['website.facebook'] ?? prev.facebook,
          instagram: map['website.instagram'] ?? prev.instagram,
        }));
        setPayment(prev => ({
          stripePublic: map['payment.stripePublic'] ?? prev.stripePublic,
          stripeSecret: prev.stripeSecret, // secret không lưu/không trả về
          mode: map['payment.mode'] ?? prev.mode,
          currency: map['payment.currency'] ?? prev.currency,
          minDeposit: map['payment.minDeposit'] ?? prev.minDeposit,
          processingFeeRate: map['payment.processingFeeRate'] ?? prev.processingFeeRate,
        }));
        setSecurity(prev => ({
          sessionTimeout: map['security.sessionTimeout'] ?? prev.sessionTimeout,
          maxLoginAttempts: map['security.maxLoginAttempts'] ?? prev.maxLoginAttempts,
          twoFactor: asBool(map['security.twoFactor'], prev.twoFactor),
          ipWhitelist: asBool(map['security.ipWhitelist'], prev.ipWhitelist),
          passwordMinLength: map['security.passwordMinLength'] ?? prev.passwordMinLength,
          autoLogout: asBool(map['security.autoLogout'], prev.autoLogout),
        }));
        setNotifications(prev => ({
          emailNewBooking: asBool(map['notifications.emailNewBooking'], prev.emailNewBooking),
          emailCancellation: asBool(map['notifications.emailCancellation'], prev.emailCancellation),
          emailPayment: asBool(map['notifications.emailPayment'], prev.emailPayment),
          smsNewBooking: asBool(map['notifications.smsNewBooking'], prev.smsNewBooking),
          smsPayment: asBool(map['notifications.smsPayment'], prev.smsPayment),
          adminDailyReport: asBool(map['notifications.adminDailyReport'], prev.adminDailyReport),
        }));
      })
      .catch(() => { /* backend chưa chạy — dùng giá trị mặc định */ })
      .finally(() => setLoading(false));
  }, []);

  // Lưu một nhóm cài đặt xuống DB (bảng app_settings)
  const handleSave = async (section: string, settings: Record<string, string>) => {
    try {
      await settingApi.updateAll(settings);
      setSaved(section);
      setTimeout(() => setSaved(null), 3000);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Lưu cài đặt thất bại — kiểm tra backend đã chạy ở cổng 8080.');
    }
  };

  const SectionHeader = ({ title, desc, icon }: { title: string; desc: string; icon: string }) => (
    <div className="flex items-start gap-3 mb-5">
      <div className="w-10 h-10 rounded-xl bg-navy/5 flex items-center justify-center text-xl shrink-0">{icon}</div>
      <div>
        <h3 className="font-display text-navy font-semibold">{title}</h3>
        <p className="text-muted text-sm">{desc}</p>
      </div>
    </div>
  );

  const TextField = ({ label, val, onChange, type = 'text', disabled = false }: {
    label: string; val: string; onChange?: (v: string) => void; type?: string; disabled?: boolean;
  }) => (
    <div>
      <label className="text-xs font-semibold text-muted uppercase tracking-wide mb-1.5 block">{label}</label>
      <input
        type={type}
        value={val}
        onChange={e => onChange?.(e.target.value)}
        disabled={disabled}
        className={`w-full px-3 py-2.5 text-sm rounded-lg border text-navy ${disabled ? 'bg-cream-dark text-muted cursor-not-allowed' : 'bg-cream border-cream-dark'}`}
      />
    </div>
  );

  const Toggle = ({ label, desc, val, onChange }: { label: string; desc: string; val: boolean; onChange: (v: boolean) => void }) => (
    <label className="flex items-start justify-between gap-4 cursor-pointer">
      <div>
        <p className="text-navy text-sm font-medium">{label}</p>
        <p className="text-muted text-xs mt-0.5">{desc}</p>
      </div>
      <div
        onClick={() => onChange(!val)}
        className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors cursor-pointer mt-0.5 ${val ? 'bg-navy' : 'bg-cream-dark'}`}
      >
        <span className={`inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform mt-0.5 ${val ? 'translate-x-5 bg-gold' : 'translate-x-0.5'}`} />
      </div>
    </label>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-3 border-gold/30 border-t-gold rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn max-w-3xl">
      <div>
        <h2 className="font-display text-2xl text-navy font-semibold">Cài Đặt Hệ Thống</h2>
        <p className="text-muted text-sm mt-0.5">Quản lý cấu hình website, thanh toán và bảo mật</p>
      </div>

      {saved && (
        <div className="bg-success/10 border border-success/20 text-success text-sm px-4 py-3 rounded-xl flex items-center gap-2 animate-fadeIn">
          <span>✓</span> Cài đặt <strong>{saved}</strong> đã được lưu thành công!
        </div>
      )}

      {/* Website info */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-cream-dark">
        <SectionHeader title="Thông Tin Website" desc="Cấu hình thông tin cơ bản và liên hệ" icon="🌐" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          <TextField label="Tên Website" val={website.name} onChange={v => setWebsite(p => ({ ...p, name: v }))} />
          <TextField label="Email Liên Hệ" val={website.email} onChange={v => setWebsite(p => ({ ...p, email: v }))} type="email" />
          <TextField label="Số Điện Thoại" val={website.phone} onChange={v => setWebsite(p => ({ ...p, phone: v }))} />
          <TextField label="Địa Chỉ" val={website.address} onChange={v => setWebsite(p => ({ ...p, address: v }))} />
          <TextField label="Facebook URL" val={website.facebook} onChange={v => setWebsite(p => ({ ...p, facebook: v }))} />
          <TextField label="Instagram URL" val={website.instagram} onChange={v => setWebsite(p => ({ ...p, instagram: v }))} />
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-muted uppercase tracking-wide mb-1.5 block">Tagline</label>
            <textarea value={website.tagline} onChange={e => setWebsite(p => ({ ...p, tagline: e.target.value }))} rows={2} className="w-full px-3 py-2.5 text-sm rounded-lg border border-cream-dark text-navy bg-cream resize-none" />
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => handleSave('Thông tin website', {
              'website.name': website.name,
              'website.tagline': website.tagline,
              'website.email': website.email,
              'website.phone': website.phone,
              'website.address': website.address,
              'website.facebook': website.facebook,
              'website.instagram': website.instagram,
            })}
            className="px-6 py-2.5 bg-navy text-gold rounded-xl text-sm font-semibold hover:bg-navy-light transition-colors"
          >
            Lưu Thay Đổi
          </button>
          <div className="flex items-center gap-2 text-muted text-sm">
            <span>Logo: </span>
            <div className="border-2 border-dashed border-cream-dark rounded-lg px-4 py-2 text-xs hover:border-gold/40 cursor-pointer transition-colors">
              📸 Tải Lên Logo
            </div>
          </div>
        </div>
      </div>

      {/* Payment gateway */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-cream-dark">
        <SectionHeader title="Cổng Thanh Toán" desc="Cấu hình Stripe và thông số thanh toán" icon="💳" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          <TextField label="Stripe Public Key" val={payment.stripePublic} onChange={v => setPayment(p => ({ ...p, stripePublic: v }))} />
          <TextField label="Stripe Secret Key" val={payment.stripeSecret} type="password" disabled />

          <div>
            <label className="text-xs font-semibold text-muted uppercase tracking-wide mb-1.5 block">Chế Độ</label>
            <div className="flex gap-2">
              {[{ val: 'test', label: '🧪 Test Mode' }, { val: 'live', label: '🚀 Live Mode' }].map(m => (
                <button
                  key={m.val}
                  onClick={() => setPayment(p => ({ ...p, mode: m.val }))}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                    payment.mode === m.val
                      ? m.val === 'live' ? 'bg-success text-cream border-success' : 'bg-navy text-gold border-navy'
                      : 'border-cream-dark text-muted hover:border-navy/30'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted uppercase tracking-wide mb-1.5 block">Đơn Vị Tiền Tệ</label>
            <select value={payment.currency} onChange={e => setPayment(p => ({ ...p, currency: e.target.value }))} className="w-full px-3 py-2.5 text-sm rounded-lg border border-cream-dark text-navy bg-cream cursor-pointer">
              <option value="VND">VND - Việt Nam Đồng</option>
              <option value="USD">USD - US Dollar</option>
            </select>
          </div>

          <TextField label="Phí Xử Lý (%)" val={payment.processingFeeRate} onChange={v => setPayment(p => ({ ...p, processingFeeRate: v }))} type="number" />
          <TextField label="Đặt Cọc Tối Thiểu (tháng)" val={payment.minDeposit} onChange={v => setPayment(p => ({ ...p, minDeposit: v }))} type="number" />
        </div>

        {payment.mode === 'live' && (
          <div className="bg-warning/10 border border-warning/30 rounded-xl p-3 mb-4 flex items-start gap-2">
            <span>⚠️</span>
            <p className="text-sm text-warning">Bạn đang ở Live Mode. Các giao dịch sẽ thu tiền thực tế từ khách hàng.</p>
          </div>
        )}

        <button
          onClick={() => handleSave('Cổng thanh toán', {
            'payment.stripePublic': payment.stripePublic,
            'payment.mode': payment.mode,
            'payment.currency': payment.currency,
            'payment.minDeposit': payment.minDeposit,
            'payment.processingFeeRate': payment.processingFeeRate,
          })}
          className="px-6 py-2.5 bg-navy text-gold rounded-xl text-sm font-semibold hover:bg-navy-light transition-colors"
        >
          Lưu Cài Đặt Thanh Toán
        </button>
      </div>

      {/* Security */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-cream-dark">
        <SectionHeader title="Cài Đặt Bảo Mật" desc="Quản lý phiên đăng nhập và xác thực" icon="🔒" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          <TextField label="Timeout Phiên (phút)" val={security.sessionTimeout} onChange={v => setSecurity(p => ({ ...p, sessionTimeout: v }))} type="number" />
          <TextField label="Số Lần Đăng Nhập Sai Tối Đa" val={security.maxLoginAttempts} onChange={v => setSecurity(p => ({ ...p, maxLoginAttempts: v }))} type="number" />
          <TextField label="Độ Dài Mật Khẩu Tối Thiểu" val={security.passwordMinLength} onChange={v => setSecurity(p => ({ ...p, passwordMinLength: v }))} type="number" />
        </div>
        <div className="space-y-4 mb-5">
          <Toggle label="Xác Thực 2 Yếu Tố (2FA)" desc="Yêu cầu OTP khi đăng nhập" val={security.twoFactor} onChange={v => setSecurity(p => ({ ...p, twoFactor: v }))} />
          <Toggle label="IP Whitelist" desc="Chỉ cho phép địa chỉ IP được phê duyệt truy cập admin" val={security.ipWhitelist} onChange={v => setSecurity(p => ({ ...p, ipWhitelist: v }))} />
          <Toggle label="Tự Động Đăng Xuất" desc="Tự động đăng xuất sau thời gian không hoạt động" val={security.autoLogout} onChange={v => setSecurity(p => ({ ...p, autoLogout: v }))} />
        </div>
        <button
          onClick={() => handleSave('Bảo mật', {
            'security.sessionTimeout': security.sessionTimeout,
            'security.maxLoginAttempts': security.maxLoginAttempts,
            'security.passwordMinLength': security.passwordMinLength,
            'security.twoFactor': String(security.twoFactor),
            'security.ipWhitelist': String(security.ipWhitelist),
            'security.autoLogout': String(security.autoLogout),
          })}
          className="px-6 py-2.5 bg-navy text-gold rounded-xl text-sm font-semibold hover:bg-navy-light transition-colors"
        >
          Lưu Cài Đặt Bảo Mật
        </button>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-cream-dark">
        <SectionHeader title="Cài Đặt Thông Báo" desc="Quản lý email và SMS tự động" icon="🔔" />
        <div className="space-y-4 mb-5">
          <div>
            <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">Email Tự Động</p>
            <div className="space-y-3">
              <Toggle label="Đặt Chỗ Mới" desc="Gửi email xác nhận khi có đặt chỗ mới" val={notifications.emailNewBooking} onChange={v => setNotifications(p => ({ ...p, emailNewBooking: v }))} />
              <Toggle label="Hủy Đặt Chỗ" desc="Thông báo khi đặt chỗ bị hủy" val={notifications.emailCancellation} onChange={v => setNotifications(p => ({ ...p, emailCancellation: v }))} />
              <Toggle label="Xác Nhận Thanh Toán" desc="Gửi biên lai thanh toán qua email" val={notifications.emailPayment} onChange={v => setNotifications(p => ({ ...p, emailPayment: v }))} />
            </div>
          </div>
          <hr className="border-cream-dark" />
          <div>
            <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">SMS & Báo Cáo</p>
            <div className="space-y-3">
              <Toggle label="SMS Đặt Chỗ Mới" desc="Gửi SMS thông báo đến người dùng" val={notifications.smsNewBooking} onChange={v => setNotifications(p => ({ ...p, smsNewBooking: v }))} />
              <Toggle label="SMS Thanh Toán" desc="Xác nhận thanh toán qua SMS" val={notifications.smsPayment} onChange={v => setNotifications(p => ({ ...p, smsPayment: v }))} />
              <Toggle label="Báo Cáo Hàng Ngày Admin" desc="Gửi tóm tắt hoạt động hàng ngày cho admin" val={notifications.adminDailyReport} onChange={v => setNotifications(p => ({ ...p, adminDailyReport: v }))} />
            </div>
          </div>
        </div>
        <button
          onClick={() => handleSave('Thông báo', {
            'notifications.emailNewBooking': String(notifications.emailNewBooking),
            'notifications.emailCancellation': String(notifications.emailCancellation),
            'notifications.emailPayment': String(notifications.emailPayment),
            'notifications.smsNewBooking': String(notifications.smsNewBooking),
            'notifications.smsPayment': String(notifications.smsPayment),
            'notifications.adminDailyReport': String(notifications.adminDailyReport),
          })}
          className="px-6 py-2.5 bg-navy text-gold rounded-xl text-sm font-semibold hover:bg-navy-light transition-colors"
        >
          Lưu Cài Đặt Thông Báo
        </button>
      </div>

      {/* Danger zone */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-error/20">
        <SectionHeader title="Vùng Nguy Hiểm" desc="Các thao tác không thể hoàn tác" icon="⚠️" />
        <div className="space-y-3">
          {[
            { label: 'Xóa Toàn Bộ Cache', desc: 'Xóa cache hệ thống để làm mới dữ liệu', action: 'Xóa Cache' },
            { label: 'Backup Cơ Sở Dữ Liệu', desc: 'Tạo bản sao lưu toàn bộ dữ liệu', action: 'Tạo Backup' },
            { label: 'Reset Hệ Thống', desc: 'Đặt lại toàn bộ cấu hình về mặc định', action: 'Reset' },
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between p-4 bg-error/5 rounded-xl border border-error/10">
              <div>
                <p className="text-navy text-sm font-semibold">{item.label}</p>
                <p className="text-muted text-xs">{item.desc}</p>
              </div>
              <button className="text-xs text-error border border-error/30 px-4 py-2 rounded-lg hover:bg-error hover:text-cream transition-all font-semibold">
                {item.action}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
