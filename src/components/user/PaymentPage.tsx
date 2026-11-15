import { useState } from 'react';
import { View, Property } from '../../data/mockData';
import { bookingApi, Booking as ApiBooking, paymentApi, PaymentTx, User as ApiUser } from '../../utils/api';

interface PaymentPageProps {
  navigate: (view: View, data?: unknown) => void;
  property: Property;
  bookingParams: { months: number; startDate: string; endDate: string; processingFee: number; deposit: number; total: number };
  form: { fullName: string; email: string; phone: string; paymentMethod: string; notes: string };
  currentUser: ApiUser | null;
}

const paymentMethodLabels: Record<string, string> = {
  card: 'Thẻ tín dụng',
  bank: 'Chuyển khoản ngân hàng',
  momo: 'Ví điện tử MoMo',
};

export default function PaymentPage({ navigate, property, bookingParams, form, currentUser }: PaymentPageProps) {
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState(form.fullName);
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [bankCode, setBankCode] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [createdBooking, setCreatedBooking] = useState<ApiBooking | null>(null);
  const [txRef, setTxRef] = useState('');

  const formatCard = (val: string) => val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
  const formatExpiry = (val: string) => {
    const v = val.replace(/\D/g, '').slice(0, 4);
    return v.length > 2 ? v.slice(0, 2) + '/' + v.slice(2) : v;
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (form.paymentMethod === 'card') {
      if (cardNumber.replace(/\s/g, '').length < 16) e.cardNumber = 'Số thẻ phải có 16 chữ số';
      if (!cardHolder.trim()) e.cardHolder = 'Vui lòng nhập tên chủ thẻ';
      if (!/^\d{2}\/\d{2}$/.test(expiry)) e.expiry = 'Định dạng MM/YY';
      if (cvv.length < 3) e.cvv = 'CVV phải có 3-4 chữ số';
    }
    if (form.paymentMethod === 'bank' && !bankCode) e.bankCode = 'Vui lòng chọn ngân hàng';
    return e;
  };

  const handlePay = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    if (!currentUser) {
      setErrors({ cardNumber: 'Phiên đăng nhập đã hết, vui lòng đăng nhập lại' });
      return;
    }
    setProcessing(true);
    try {
      // Gửi DTO gọn: server tự validate và tự tính giá từ bảng fees,
      // client không thể giả mạo tổng tiền
      const booking = await bookingApi.create({
        userId: currentUser.id,
        propertyId: Number(property.id),
        months: bookingParams.months,
        startDate: bookingParams.startDate,
        notes: form.notes || '',
        paymentMethod: paymentMethodLabels[form.paymentMethod] || form.paymentMethod,
      });
      // Tạo giao dịch thanh toán (server ghi nhận + đồng bộ tổng chi tiêu + gửi email xác nhận)
      const tx: PaymentTx = await paymentApi.pay(booking.id, paymentMethodLabels[form.paymentMethod] || form.paymentMethod);
      setCreatedBooking(booking);
      setTxRef(tx.reference);
      setSuccess(true);
    } catch (err) {
      alert(err instanceof Error ? `Tạo đặt chỗ thất bại: ${err.message}` : 'Tạo đặt chỗ thất bại');
    } finally {
      setProcessing(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center animate-fadeIn">
          <div className="w-20 h-20 rounded-full bg-warning/10 border-2 border-warning flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">⏳</span>
          </div>
          <h2 className="font-display text-3xl text-navy font-semibold mb-2">Đang Chờ Xác Nhận!</h2>
          <p className="text-muted mb-6">Đơn đặt chỗ của bạn đã được ghi nhận. Vui lòng chờ admin xác nhận thanh toán trong vòng 24 giờ.</p>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-warning/20 text-left mb-6">
            <div className="flex items-center gap-3 mb-4">
              <img src={property.images[0]} alt={property.name} className="w-16 h-12 object-cover rounded-lg" />
              <div>
                <p className="font-display text-navy font-semibold">{property.name}</p>
                <p className="text-muted text-xs">{property.resort}</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">Mã giao dịch</span>
                <span className="font-mono-data text-navy text-xs">{txRef || '---'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Mã đặt chỗ</span>
                <span className="font-mono-data text-navy font-bold">#{createdBooking?.id ?? '---'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Ngày nhận phòng</span>
                <span className="font-mono-data text-navy text-xs">{bookingParams.startDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Thời hạn</span>
                <span className="text-navy">{bookingParams.months} tháng</span>
              </div>
              <hr className="border-cream-dark" />
              <div className="flex justify-between font-bold">
                <span className="text-navy">Số tiền thanh toán</span>
                <span className="font-display text-warning">{bookingParams.total.toFixed(1)} triệu VNĐ</span>
              </div>
            </div>
          </div>

          <div className="bg-warning/10 border border-warning/30 rounded-xl p-4 mb-6">
            <p className="text-sm text-navy font-semibold mb-1">⚠️ Lưu ý quan trọng</p>
            <p className="text-xs text-muted">Admin sẽ xác nhận thanh toán của bạn trong vòng 24 giờ. Sau khi được xác nhận, bạn sẽ nhận email thông báo đặt chỗ thành công.</p>
          </div>

          <p className="text-sm text-muted mb-6">
            Email thông báo đã gửi đến <strong className="text-navy">{form.email}</strong>
          </p>

          <div className="flex gap-3">
            <button
              onClick={() => navigate('history')}
              className="flex-1 py-3 rounded-xl bg-navy text-gold font-semibold text-sm hover:bg-navy-light transition-colors"
            >
              Xem Lịch Sử Đặt Chỗ
            </button>
            <button
              onClick={() => navigate('home')}
              className="flex-1 py-3 rounded-xl border border-cream-dark text-navy font-semibold text-sm hover:border-navy/40 transition-colors"
            >
              Về Trang Chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <div className="bg-navy py-8 px-6">
        <div className="max-w-4xl mx-auto">
          <button onClick={() => navigate('booking-confirm')} className="text-cream/60 hover:text-gold text-sm mb-4 flex items-center gap-1">
            ← Quay Lại
          </button>
          <h1 className="font-display text-2xl text-cream font-semibold">Cổng Thanh Toán</h1>
          <p className="text-cream/60 text-sm mt-1 flex items-center gap-2">
            <span>🔒</span> Kết nối bảo mật SSL 256-bit · PCI DSS Compliant
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payment form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            {form.paymentMethod === 'card' && (
              <div className="space-y-5 animate-fadeIn">
                <h3 className="font-display text-xl text-navy font-semibold">Thông Tin Thẻ</h3>

                {/* Card preview */}
                <div className="h-40 rounded-2xl p-5 text-cream relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0D1F35 0%, #243B55 60%, #1B5E7A 100%)' }}>
                  <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, white 0%, transparent 60%)' }} />
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-10 h-7 rounded bg-gold/80" />
                    <span className="text-gold text-xs font-semibold tracking-widest uppercase">VISA</span>
                  </div>
                  <p className="font-mono-data text-lg tracking-widest mb-3">
                    {cardNumber || '•••• •••• •••• ••••'}
                  </p>
                  <div className="flex justify-between text-xs text-cream/70">
                    <span>{cardHolder || 'TÊN CHỦ THẺ'}</span>
                    <span>{expiry || 'MM/YY'}</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted uppercase tracking-wide mb-1.5 block">Số Thẻ</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={e => { setCardNumber(formatCard(e.target.value)); if (errors.cardNumber) setErrors(e => { const n = {...e}; delete n.cardNumber; return n; }); }}
                    placeholder="0000 0000 0000 0000"
                    className={`w-full px-4 py-2.5 text-sm rounded-lg border font-mono-data text-navy bg-cream ${errors.cardNumber ? 'border-error' : 'border-cream-dark'}`}
                  />
                  {errors.cardNumber && <p className="text-error text-xs mt-1">{errors.cardNumber}</p>}
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted uppercase tracking-wide mb-1.5 block">Tên Chủ Thẻ</label>
                  <input
                    type="text"
                    value={cardHolder}
                    onChange={e => { setCardHolder(e.target.value.toUpperCase()); if (errors.cardHolder) setErrors(e => { const n = {...e}; delete n.cardHolder; return n; }); }}
                    placeholder="NGUYEN VAN A"
                    className={`w-full px-4 py-2.5 text-sm rounded-lg border text-navy bg-cream ${errors.cardHolder ? 'border-error' : 'border-cream-dark'}`}
                  />
                  {errors.cardHolder && <p className="text-error text-xs mt-1">{errors.cardHolder}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-muted uppercase tracking-wide mb-1.5 block">Ngày Hết Hạn</label>
                    <input
                      type="text"
                      value={expiry}
                      onChange={e => { setExpiry(formatExpiry(e.target.value)); if (errors.expiry) setErrors(e => { const n = {...e}; delete n.expiry; return n; }); }}
                      placeholder="MM/YY"
                      className={`w-full px-4 py-2.5 text-sm rounded-lg border font-mono-data text-navy bg-cream ${errors.expiry ? 'border-error' : 'border-cream-dark'}`}
                    />
                    {errors.expiry && <p className="text-error text-xs mt-1">{errors.expiry}</p>}
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted uppercase tracking-wide mb-1.5 block">CVV</label>
                    <input
                      type="password"
                      value={cvv}
                      onChange={e => { setCvv(e.target.value.replace(/\D/g, '').slice(0, 4)); if (errors.cvv) setErrors(e => { const n = {...e}; delete n.cvv; return n; }); }}
                      placeholder="•••"
                      className={`w-full px-4 py-2.5 text-sm rounded-lg border font-mono-data text-navy bg-cream ${errors.cvv ? 'border-error' : 'border-cream-dark'}`}
                    />
                    {errors.cvv && <p className="text-error text-xs mt-1">{errors.cvv}</p>}
                  </div>
                </div>
              </div>
            )}

            {form.paymentMethod === 'bank' && (
              <div className="space-y-4 animate-fadeIn">
                <h3 className="font-display text-xl text-navy font-semibold">Chuyển Khoản Ngân Hàng</h3>
                <div>
                  <label className="text-xs font-semibold text-muted uppercase tracking-wide mb-2 block">Chọn Ngân Hàng</label>
                  <div className="grid grid-cols-3 gap-3">
                    {['Vietcombank', 'Techcombank', 'MB Bank', 'ACB', 'BIDV', 'VPBank'].map(b => (
                      <button
                        key={b}
                        onClick={() => setBankCode(b)}
                        className={`py-3 px-2 rounded-xl border text-xs font-semibold text-center transition-all ${bankCode === b ? 'border-navy bg-navy text-gold' : 'border-cream-dark text-navy hover:border-navy/30'}`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                  {errors.bankCode && <p className="text-error text-xs mt-2">{errors.bankCode}</p>}
                </div>
                {bankCode && (
                  <div className="bg-cream rounded-xl p-4 space-y-2 text-sm animate-fadeIn">
                    <p className="font-semibold text-navy">{bankCode}</p>
                    <div className="flex justify-between"><span className="text-muted">Số tài khoản:</span><span className="font-mono-data text-navy">0012345678901</span></div>
                    <div className="flex justify-between"><span className="text-muted">Chủ tài khoản:</span><span className="text-navy">RESORT REGISTRY VN</span></div>
                    <div className="flex justify-between"><span className="text-muted">Nội dung CK:</span><span className="font-mono-data text-navy text-xs">BK-{Date.now().toString().slice(-6)}</span></div>
                    <div className="flex justify-between font-bold"><span className="text-navy">Số tiền:</span><span className="text-navy">{(bookingParams.total * 25).toLocaleString()} VNĐ</span></div>
                  </div>
                )}
              </div>
            )}

            {form.paymentMethod === 'momo' && (
              <div className="text-center py-8 animate-fadeIn">
                <div className="w-32 h-32 bg-pink-50 rounded-2xl border-2 border-pink-200 flex items-center justify-center mx-auto mb-4">
                  <p className="text-5xl">📱</p>
                </div>
                <h3 className="font-display text-xl text-navy font-semibold mb-2">Quét QR MoMo</h3>
                <p className="text-muted text-sm mb-4">Mở ứng dụng MoMo và quét mã QR để thanh toán</p>
                <p className="font-display text-2xl text-navy font-bold">{bookingParams.total.toFixed(1)} tr VNĐ</p>
              </div>
            )}

            <button
              onClick={handlePay}
              disabled={processing}
              className={`w-full mt-6 py-4 rounded-xl font-semibold text-sm transition-all ${
                processing
                  ? 'bg-navy/70 text-gold cursor-not-allowed'
                  : 'bg-navy text-gold hover:bg-navy-light shadow-lg hover:shadow-navy/20'
              }`}
            >
              {processing ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
                  Đang Xử Lý...
                </span>
              ) : (
                `🔒 Thanh Toán ${bookingParams.total.toFixed(1)} Triệu VNĐ`
              )}
            </button>
          </div>
        </div>

        {/* Order summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-cream-dark sticky top-20">
            <h3 className="font-display text-navy font-semibold mb-4">Đơn Hàng</h3>
            <img src={property.images[0]} alt={property.name} className="w-full h-28 object-cover rounded-xl mb-3" />
            <p className="font-display text-navy font-semibold text-sm">{property.name}</p>
            <p className="text-muted text-xs mb-4">{bookingParams.months} tháng · {bookingParams.startDate}</p>

            <div className="space-y-2 text-sm border-t border-cream-dark pt-4">
              <div className="flex justify-between">
                <span className="text-muted">Tiền thuê</span>
                <span className="font-mono-data text-xs text-navy">{(property.price * bookingParams.months).toFixed(0)} triệu VNĐ</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Phí xử lý</span>
                <span className="font-mono-data text-xs text-navy">{bookingParams.processingFee.toFixed(1)} triệu VNĐ</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Đặt cọc</span>
                <span className="font-mono-data text-xs text-navy">{bookingParams.deposit} triệu VNĐ</span>
              </div>
              <hr className="border-cream-dark" />
              <div className="flex justify-between font-bold">
                <span className="text-navy">Tổng</span>
                <span className="font-display text-navy text-lg">{bookingParams.total.toFixed(1)} triệu VNĐ</span>
              </div>
            </div>

            <div className="mt-4 space-y-1.5">
              {['Bảo mật SSL 256-bit', 'Bảo vệ bởi Stripe', 'PCI DSS Level 1'].map(s => (
                <div key={s} className="flex items-center gap-2 text-xs text-muted">
                  <span className="text-success">✓</span> {s}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
