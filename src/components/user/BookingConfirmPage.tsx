import { View, Property } from '../../data/mockData';

interface BookingConfirmPageProps {
  navigate: (view: View, data?: unknown) => void;
  property: Property;
  bookingParams: { months: number; startDate: string; endDate: string; processingFee: number; deposit: number; total: number };
  form: { fullName: string; email: string; phone: string; cmnd: string; address: string; occupation: string; income: string; paymentMethod: string; notes: string };
}

export default function BookingConfirmPage({ navigate, property, bookingParams, form }: BookingConfirmPageProps) {
  const paymentLabels: Record<string, string> = {
    card: '💳 Thẻ tín dụng / ghi nợ',
    bank: '🏦 Chuyển khoản ngân hàng',
    momo: '📱 Ví điện tử MoMo',
  };

  return (
    <div className="min-h-screen bg-cream">
      <div className="bg-navy py-8 px-6">
        <div className="max-w-4xl mx-auto">
          <button onClick={() => navigate('booking-form', property)} className="text-cream/60 hover:text-gold text-sm mb-4 flex items-center gap-1">
            ← Quay Lại Form
          </button>
          <h1 className="font-display text-2xl text-cream font-semibold">Xác Nhận Đặt Chỗ</h1>
          <p className="text-cream/60 text-sm mt-1">Vui lòng kiểm tra thông tin trước khi thanh toán</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Summary */}
        <div className="lg:col-span-2 space-y-5">
          {/* Property card */}
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
            <div className="flex gap-4 p-5">
              <img src={property.images[0]} alt={property.name} className="w-28 h-20 object-cover rounded-xl shrink-0" />
              <div>
                <p className="text-muted text-xs">{property.resort} · {property.province}</p>
                <h3 className="font-display text-navy font-semibold text-lg">{property.name}</h3>
                <div className="flex gap-3 mt-1 text-xs text-muted">
                  <span>🛏 {property.bedrooms} PN</span>
                  <span>📐 {property.area} m²</span>
                  <span className="text-gold">★ {property.rating}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Booking details */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h3 className="font-semibold text-navy mb-4">Chi Tiết Đặt Chỗ</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
              {[
                { label: 'Nhận Phòng', val: bookingParams.startDate, icon: '📅' },
                { label: 'Trả Phòng', val: bookingParams.endDate, icon: '📅' },
                { label: 'Thời Hạn', val: `${bookingParams.months} tháng`, icon: '⏱' },
                { label: 'Giá/Tháng', val: `${property.price} tr`, icon: '💰' },
              ].map(d => (
                <div key={d.label} className="bg-cream rounded-xl p-3 text-center">
                  <p className="text-xl mb-1">{d.icon}</p>
                  <p className="text-xs text-muted">{d.label}</p>
                  <p className="font-semibold text-navy text-sm mt-0.5 font-mono-data">{d.val}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Booker info */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h3 className="font-semibold text-navy mb-4">Thông Tin Người Đăng Ký</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              {[
                { label: 'Họ Tên', val: form.fullName },
                { label: 'Email', val: form.email },
                { label: 'Điện Thoại', val: form.phone },
                { label: 'CMND/CCCD', val: form.cmnd },
                { label: 'Địa Chỉ', val: form.address },
                { label: 'Nghề Nghiệp', val: form.occupation },
              ].map(row => (
                <div key={row.label} className="flex flex-col gap-0.5">
                  <span className="text-xs text-muted">{row.label}</span>
                  <span className="text-navy font-medium">{row.val}</span>
                </div>
              ))}
            </div>
            {form.notes && (
              <div className="mt-3 pt-3 border-t border-cream-dark">
                <p className="text-xs text-muted mb-1">Ghi Chú</p>
                <p className="text-sm text-navy">{form.notes}</p>
              </div>
            )}
          </div>

          {/* Payment method */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h3 className="font-semibold text-navy mb-3">Phương Thức Thanh Toán</h3>
            <div className="flex items-center gap-3 p-3 bg-cream rounded-xl border border-gold/20">
              <span className="text-2xl">{form.paymentMethod === 'card' ? '💳' : form.paymentMethod === 'bank' ? '🏦' : '📱'}</span>
              <span className="font-semibold text-navy">{paymentLabels[form.paymentMethod]}</span>
              <span className="ml-auto text-xs text-success bg-success/10 border border-success/20 px-2 py-0.5 rounded-full">Đã chọn</span>
            </div>
          </div>

          {/* Cancellation policy */}
          <div className="bg-amber-50 border border-warning/30 rounded-2xl p-5">
            <h3 className="font-semibold text-navy mb-2 flex items-center gap-2">
              <span>⚠️</span> Chính Sách Hủy Đặt
            </h3>
            <ul className="text-sm text-navy/70 space-y-1">
              <li>• Hủy trước 30 ngày: Hoàn 80% đặt cọc</li>
              <li>• Hủy trong vòng 30 ngày: Hoàn 50% đặt cọc</li>
              <li>• Phí xử lý hồ sơ không được hoàn</li>
            </ul>
          </div>
        </div>

        {/* Right: Payment summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-cream-dark sticky top-20">
            <h3 className="font-display text-navy font-semibold mb-4">Tổng Chi Phí</h3>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">Tiền thuê</span>
                <span className="font-mono-data text-navy">{property.price * bookingParams.months} tr</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted flex items-center gap-1">
                  Phí xử lý (5%)
                  <span className="text-xs bg-cream text-muted px-1.5 py-0.5 rounded-full">Bắt buộc</span>
                </span>
                <span className="font-mono-data text-navy">{bookingParams.processingFee.toFixed(1)} tr</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted flex items-center gap-1">
                  Đặt cọc
                  <span className="text-xs bg-success/10 text-success px-1.5 py-0.5 rounded-full">Hoàn trả</span>
                </span>
                <span className="font-mono-data text-navy">{bookingParams.deposit} tr</span>
              </div>
              <hr className="border-cream-dark" />
              <div className="flex justify-between font-bold">
                <span className="text-navy">TỔNG CỘNG</span>
                <span className="font-display text-2xl text-navy">{bookingParams.total.toFixed(1)} tr</span>
              </div>
              <p className="text-xs text-muted text-center">≈ {(bookingParams.total * 25).toLocaleString('vi-VN')} VNĐ</p>
            </div>

            <div className="mt-5 space-y-3">
              <button
                onClick={() => navigate('payment', { property, bookingParams, form })}
                className="w-full py-3.5 rounded-xl bg-navy text-gold font-semibold hover:bg-navy-light transition-colors shadow-lg text-sm"
              >
                Tiến Hành Thanh Toán →
              </button>
              <button
                onClick={() => navigate('listings')}
                className="w-full py-2.5 rounded-xl border border-cream-dark text-muted font-medium text-sm hover:border-navy/30 hover:text-navy transition-colors"
              >
                Hủy Và Quay Lại
              </button>
            </div>

            <div className="mt-4 pt-4 border-t border-cream-dark space-y-1.5">
              <div className="flex items-center gap-2 text-xs text-muted">
                <span>🔒</span> Thanh toán bảo mật SSL 256-bit
              </div>
              <div className="flex items-center gap-2 text-xs text-muted">
                <span>✓</span> Xác nhận ngay qua email & SMS
              </div>
              <div className="flex items-center gap-2 text-xs text-muted">
                <span>📋</span> Hóa đơn điện tử tự động
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
