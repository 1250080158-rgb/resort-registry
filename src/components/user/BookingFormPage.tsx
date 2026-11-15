import { useState, useCallback } from 'react';
import { View, Property, User } from '../../data/mockData';

interface BookingFormPageProps {
  navigate: (view: View, data?: unknown) => void;
  property: Property;
  bookingParams: { months: number; startDate: string; processingFee: number; deposit: number; total: number };
  currentUser: User;
}

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  cmnd: string;
  address: string;
  occupation: string;
  income: string;
  paymentMethod: string;
  notes: string;
  agreeTerms: boolean;
  agreePolicy: boolean;
}

interface FormErrors {
  [key: string]: string;
}

interface InputFieldProps {
  label: string;
  field: keyof FormData;
  type?: string;
  required?: boolean;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

const InputField = ({ label, field, type = 'text', required = true, placeholder = '', value, onChange, error }: InputFieldProps) => (
  <div>
    <label className="text-xs font-semibold text-muted uppercase tracking-wide mb-1.5 block">
      {label} {required && <span className="text-error">*</span>}
    </label>
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      autoComplete="off"
      autoCapitalize="off"
      autoCorrect="off"
      spellCheck={false}
      className={`w-full px-4 py-2.5 text-sm rounded-lg border text-navy bg-cream ${
        error ? 'border-error' : 'border-cream-dark focus:border-gold/50'
      }`}
    />
    {error && <p className="text-error text-xs mt-1">{error}</p>}
  </div>
);

export default function BookingFormPage({ navigate, property, bookingParams, currentUser }: BookingFormPageProps) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>({
    fullName: currentUser.name,
    email: currentUser.email,
    phone: currentUser.phone,
    cmnd: currentUser.cmnd,
    address: currentUser.address,
    occupation: '',
    income: '',
    paymentMethod: 'card',
    notes: '',
    agreeTerms: false,
    agreePolicy: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const endDate = (() => {
    if (!bookingParams.startDate) return '';
    const d = new Date(bookingParams.startDate);
    d.setMonth(d.getMonth() + bookingParams.months);
    return d.toISOString().split('T')[0];
  })();

  const validate = (fields: Partial<FormData>): FormErrors => {
    const e: FormErrors = {};
    if ('fullName' in fields && !fields.fullName?.trim()) e.fullName = 'Vui lòng nhập họ tên';
    if ('email' in fields && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email || '')) e.email = 'Email không hợp lệ';
    if ('phone' in fields && !/^0\d{9}$/.test(fields.phone?.replace(/\s/g, '') || '')) e.phone = 'Số điện thoại không hợp lệ';
    if ('cmnd' in fields && (fields.cmnd || '').length < 9) e.cmnd = 'CMND/CCCD phải có ít nhất 9 chữ số';
    if ('address' in fields && !fields.address?.trim()) e.address = 'Vui lòng nhập địa chỉ';
    if ('occupation' in fields && !fields.occupation?.trim()) e.occupation = 'Vui lòng nhập nghề nghiệp';
    if ('income' in fields && !fields.income) e.income = 'Vui lòng chọn mức thu nhập';
    return e;
  };

  const setField = useCallback((key: keyof FormData, val: string | boolean) => {
    setForm(f => ({ ...f, [key]: val }));
    setErrors(e => { if (e[key]) { const n = { ...e }; delete n[key]; return n; } return e; });
  }, []);

  const nextStep = () => {
    let stepErrors: FormErrors = {};
    if (step === 1) stepErrors = validate({ fullName: form.fullName, email: form.email, phone: form.phone, cmnd: form.cmnd, address: form.address });
    if (step === 2) stepErrors = validate({ occupation: form.occupation, income: form.income });
    if (step === 3) {
      if (!form.agreeTerms) stepErrors.agreeTerms = 'Vui lòng đồng ý điều khoản';
      if (!form.agreePolicy) stepErrors.agreePolicy = 'Vui lòng đồng ý chính sách';
    }
    if (Object.keys(stepErrors).length > 0) { setErrors(stepErrors); return; }
    if (step < 3) setStep(s => s + 1);
    else navigate('booking-confirm', { property, bookingParams: { ...bookingParams, endDate }, form });
  };

  return (
    <div className="min-h-screen bg-cream">
      <div className="bg-navy py-8 px-6">
        <div className="max-w-4xl mx-auto">
          <button onClick={() => navigate('property-detail', property)} className="text-cream/60 hover:text-gold text-sm mb-4 flex items-center gap-1">
            ← Quay Lại
          </button>
          <h1 className="font-display text-2xl text-cream font-semibold">Form Đăng Ký Đặt Chỗ</h1>
          <p className="text-cream/60 text-sm mt-1">{property.name} · {property.province}</p>

          {/* Steps */}
          <div className="flex items-center gap-4 mt-6">
            {['Thông Tin Cá Nhân', 'Thông Tin Bổ Sung', 'Xác Nhận'].map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step > i + 1 ? 'bg-success text-cream' : step === i + 1 ? 'bg-gold text-navy' : 'bg-navy-lighter text-cream/40'
                }`}>
                  {step > i + 1 ? '✓' : i + 1}
                </div>
                <span className={`text-xs hidden sm:block ${step === i + 1 ? 'text-gold' : 'text-cream/40'}`}>{s}</span>
                {i < 2 && <div className={`w-8 h-px ${step > i + 1 ? 'bg-success' : 'bg-navy-lighter'}`} />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            {step === 1 && (
              <div className="space-y-4 animate-fadeIn">
                <h2 className="font-display text-xl text-navy font-semibold mb-5">Thông Tin Cá Nhân</h2>
                <InputField label="Họ và Tên" field="fullName" placeholder="Nguyễn Văn A" value={form.fullName} onChange={v => setField('fullName', v)} error={errors.fullName} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField label="Email" field="email" type="email" placeholder="email@example.com" value={form.email} onChange={v => setField('email', v)} error={errors.email} />
                  <InputField label="Số Điện Thoại" field="phone" placeholder="0912 345 678" value={form.phone} onChange={v => setField('phone', v)} error={errors.phone} />
                </div>
                <InputField label="CMND / CCCD" field="cmnd" placeholder="079088012345" value={form.cmnd} onChange={v => setField('cmnd', v)} error={errors.cmnd} />
                <InputField label="Địa Chỉ Thường Trú" field="address" placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành" value={form.address} onChange={v => setField('address', v)} error={errors.address} />
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4 animate-fadeIn">
                <h2 className="font-display text-xl text-navy font-semibold mb-5">Thông Tin Bổ Sung</h2>
                <InputField label="Nghề Nghiệp" field="occupation" placeholder="Kỹ sư phần mềm, Doanh nhân..." value={form.occupation} onChange={v => setField('occupation', v)} error={errors.occupation} />
                <div>
                  <label className="text-xs font-semibold text-muted uppercase tracking-wide mb-1.5 block">
                    Thu Nhập Hàng Tháng <span className="text-error">*</span>
                  </label>
                  <select
                    value={form.income}
                    onChange={e => setField('income', e.target.value)}
                    className={`w-full px-4 py-2.5 text-sm rounded-lg border text-navy bg-cream cursor-pointer ${
                      errors.income ? 'border-error' : 'border-cream-dark'
                    }`}
                  >
                    <option value="">Chọn mức thu nhập</option>
                    <option value="20-50">20 - 50 triệu / tháng</option>
                    <option value="50-100">50 - 100 triệu / tháng</option>
                    <option value="100-200">100 - 200 triệu / tháng</option>
                    <option value="200+">Trên 200 triệu / tháng</option>
                  </select>
                  {errors.income && <p className="text-error text-xs mt-1">{errors.income}</p>}
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted uppercase tracking-wide mb-2 block">
                    Phương Thức Thanh Toán
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[
                      { val: 'card', label: 'Thẻ tín dụng', icon: '💳' },
                      { val: 'bank', label: 'Chuyển khoản', icon: '🏦' },
                      { val: 'momo', label: 'Ví MoMo', icon: '📱' },
                    ].map(p => (
                      <button
                        key={p.val}
                        onClick={() => setField('paymentMethod', p.val)}
                        className={`p-3 rounded-xl border text-sm font-semibold flex flex-col items-center gap-1 transition-all ${
                          form.paymentMethod === p.val ? 'border-navy bg-navy text-gold' : 'border-cream-dark text-navy hover:border-navy/30'
                        }`}
                      >
                        <span className="text-xl">{p.icon}</span>
                        <span className="text-xs">{p.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted uppercase tracking-wide mb-1.5 block">Ghi Chú</label>
                  <textarea
                    value={form.notes}
                    onChange={e => setField('notes', e.target.value)}
                    placeholder="Yêu cầu đặc biệt, thông tin thêm..."
                    rows={3}
                    className="w-full px-4 py-2.5 text-sm rounded-lg border border-cream-dark text-navy bg-cream resize-none"
                  />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-5 animate-fadeIn">
                <h2 className="font-display text-xl text-navy font-semibold mb-5">Xác Nhận Thông Tin</h2>
                <div className="bg-cream rounded-xl p-4 space-y-2 text-sm">
                  {[
                    { label: 'Họ Tên', val: form.fullName },
                    { label: 'Email', val: form.email },
                    { label: 'Điện Thoại', val: form.phone },
                    { label: 'CMND/CCCD', val: form.cmnd },
                    { label: 'Địa Chỉ', val: form.address },
                    { label: 'Nghề Nghiệp', val: form.occupation },
                    { label: 'Thu Nhập', val: form.income },
                    { label: 'Thanh Toán', val: form.paymentMethod === 'card' ? 'Thẻ tín dụng' : form.paymentMethod === 'bank' ? 'Chuyển khoản' : 'Ví MoMo' },
                  ].map(row => (
                    <div key={row.label} className="flex gap-3">
                      <span className="text-muted w-28 shrink-0">{row.label}:</span>
                      <span className="text-navy font-medium">{row.val}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.agreeTerms}
                      onChange={e => setField('agreeTerms', e.target.checked)}
                      className="mt-0.5 accent-gold"
                    />
                    <span className="text-sm text-navy/80">
                      Tôi đã đọc và đồng ý với <a href="#" className="text-teal hover:text-navy">Điều Khoản Sử Dụng</a> và <a href="#" className="text-teal hover:text-navy">Hợp Đồng Thuê Nhà</a>
                    </span>
                  </label>
                  {errors.agreeTerms && <p className="text-error text-xs">{errors.agreeTerms}</p>}

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.agreePolicy}
                      onChange={e => setField('agreePolicy', e.target.checked)}
                      className="mt-0.5 accent-gold"
                    />
                    <span className="text-sm text-navy/80">
                      Tôi đồng ý với <a href="#" className="text-teal hover:text-navy">Chính Sách Hủy Đặt Chỗ</a> và <a href="#" className="text-teal hover:text-navy">Chính Sách Phí</a>
                    </span>
                  </label>
                  {errors.agreePolicy && <p className="text-error text-xs">{errors.agreePolicy}</p>}
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              {step > 1 && (
                <button
                  onClick={() => setStep(s => s - 1)}
                  className="flex-1 py-3 rounded-xl border border-cream-dark text-navy font-semibold text-sm hover:border-navy/40 transition-colors"
                >
                  Quay Lại
                </button>
              )}
              <button
                onClick={nextStep}
                className="flex-1 py-3 rounded-xl bg-navy text-gold font-semibold text-sm hover:bg-navy-light transition-colors"
              >
                {step < 3 ? 'Tiếp Theo →' : 'Xác Nhận Đặt Chỗ'}
              </button>
            </div>
          </div>
        </div>

        {/* Summary sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-cream-dark sticky top-20">
            <h3 className="font-display text-navy font-semibold mb-4">Tóm Tắt Đặt Chỗ</h3>
            <img src={property.images[0]} alt={property.name} className="w-full h-32 object-cover rounded-xl mb-4" />
            <p className="text-muted text-xs">{property.resort}</p>
            <p className="font-display text-navy font-semibold">{property.name}</p>
            <div className="mt-4 space-y-2 text-sm border-t border-cream-dark pt-4">
              <div className="flex justify-between">
                <span className="text-muted">Bắt đầu</span>
                <span className="font-mono-data text-navy text-xs">{bookingParams.startDate || '--'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Kết thúc</span>
                <span className="font-mono-data text-navy text-xs">{endDate || '--'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Thời hạn</span>
                <span className="text-navy font-semibold">{bookingParams.months} tháng</span>
              </div>
              <hr className="border-cream-dark" />
              <div className="flex justify-between">
                <span className="text-muted">Tiền thuê</span>
                <span className="font-mono-data text-navy">{property.price * bookingParams.months} triệu VNĐ</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Phí xử lý</span>
                <span className="font-mono-data text-navy">{bookingParams.processingFee.toFixed(1)} triệu VNĐ</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Đặt cọc</span>
                <span className="font-mono-data text-navy">{bookingParams.deposit} triệu VNĐ</span>
              </div>
              <hr className="border-cream-dark" />
              <div className="flex justify-between font-semibold">
                <span className="text-navy">Tổng Cộng</span>
                <span className="font-display text-navy">{bookingParams.total.toFixed(1)} triệu VNĐ</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
