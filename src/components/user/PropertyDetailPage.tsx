import { useEffect, useState } from 'react';
import { View, Property, User } from '../../data/mockData';
import { bookingApi, appointmentApi, chatApi, QuoteResult } from '../../utils/api';
import { propertySlug } from '../../utils/slug';
import Seo from '../../components/shared/Seo';

interface PropertyDetailPageProps {
  property: Property;
  navigate: (view: View, data?: unknown) => void;
  currentUser: User | null;
}

export default function PropertyDetailPage({ property, navigate, currentUser }: PropertyDetailPageProps) {
  const isBuy = property.transactionType === 'buy';
  const [selectedImage, setSelectedImage] = useState(0);
  const [months, setMonths] = useState(3);
  const [startDate, setStartDate] = useState('');
  const [checkingAvail, setCheckingAvail] = useState(false);
  const [available, setAvailable] = useState<null | boolean>(null);
  const [quote, setQuote] = useState<QuoteResult | null>(null);

  // Đặt lịch xem nhà: mở modal chọn ngày giờ + gửi yêu cầu tới admin
  const [showAppointment, setShowAppointment] = useState(false);
  const [apptDate, setApptDate] = useState('');
  const [apptTime, setApptTime] = useState('09:00');
  const [apptReason, setApptReason] = useState('');
  const [apptSubmitting, setApptSubmitting] = useState(false);
  const [apptSuccess, setApptSuccess] = useState(false);
  const [apptError, setApptError] = useState('');

  const timeSlots: string[] = [];
  for (let h = 8; h <= 17; h++) {
    for (const m of ['00', '30']) {
      if (h === 17 && m === '30') break;
      timeSlots.push(`${String(h).padStart(2, '0')}:${m}`);
    }
  }

  const openAppointment = () => {
    if (!currentUser) { navigate('login'); return; }
    setApptSuccess(false);
    setApptError('');
    setApptReason(`Tôi muốn xem nhà ${property.name}`);
    setShowAppointment(true);
  };

  const submitAppointment = async () => {
    if (!apptDate || !apptTime) { setApptError('Vui lòng chọn ngày và giờ hẹn'); return; }
    if (!apptReason.trim()) { setApptError('Vui lòng nhập nội dung hẹn'); return; }
    if (!currentUser) { setShowAppointment(false); navigate('login'); return; }
    setApptSubmitting(true);
    setApptError('');
    try {
      // Giao lịch cho nhân viên hỗ trợ mặc định (ADMIN, fallback STAFF)
      const staff = await chatApi.getSupport();
      await appointmentApi.create({
        customerId: Number(currentUser.id),
        staffId: staff.id,
        appointmentDate: `${apptDate}T${apptTime}:00`,
        reason: apptReason.trim(),
      });
      setApptSuccess(true);
    } catch (e) {
      setApptError(e instanceof Error ? e.message : 'Đặt lịch hẹn thất bại');
    } finally {
      setApptSubmitting(false);
    }
  };

  // Báo giá server-side: phí xử lý + đặt cọc + tổng tính từ bảng fees trong DB (chỉ nhà cho thuê)
  useEffect(() => {
    if (isBuy) return;
    let cancelled = false;
    bookingApi.quote(Number(property.id), months)
      .then(q => { if (!cancelled) setQuote(q); })
      .catch(() => { if (!cancelled) setQuote(null); }); // lỗi → fallback tính tạm ở client
    return () => { cancelled = true; };
  }, [property.id, months, isBuy]);

  // Fallback client-side khi server chưa sẵn sàng
  const processingFee = quote ? quote.processingFee : property.price * months * 0.05;
  const deposit = quote ? quote.deposit : property.price;
  const basePrice = quote ? quote.basePrice : property.price * months;
  const total = quote ? quote.total : basePrice + processingFee + deposit;

  // Kiểm tra khả dụng thật: server query các booking còn hiệu lực và check trùng lịch
  const checkAvailability = async () => {
    if (!startDate) return;
    setCheckingAvail(true);
    try {
      const ok = await bookingApi.checkAvailability(Number(property.id), startDate, months);
      setAvailable(ok);
    } catch {
      // Backend không phản hồi: fallback theo trạng thái tài sản
      setAvailable(property.status === 'available');
    } finally {
      setCheckingAvail(false);
    }
  };

  const handleBooking = () => {
    if (!currentUser) { navigate('login'); return; }
    navigate('booking-form', { property, months, startDate, processingFee, deposit, total });
  };

  const amenityIcons: Record<string, string> = {
    'Hồ bơi riêng': '🏊', 'Bãi đỗ xe': '🚗', 'Sân vườn': '🌿', 'BBQ ngoài trời': '🔥',
    'Phòng gym': '💪', 'Wifi tốc độ cao': '📶', 'An ninh 24/7': '🔒', 'Bếp đầy đủ': '🍳',
    'Điều hòa trung tâm': '❄️', 'Smart TV': '📺', 'Rooftop pool': '🏊', 'Sky lounge': '🍸',
    'Spa & Wellness': '💆', 'Concierge 24/7': '🛎', 'Valet parking': '🅿️',
    'Hồ bơi vô cực': '♾️', 'Cliff view terrace': '🌅', 'Sunset bar': '🌆', 'Private chef': '👨‍🍳',
  };

  return (
    <>
      <Seo
        title={`${property.name} - Chi tiết tại ${property.resort}, ${property.province} | ResortRegistry`}
        description={property.description.length > 160 ? `${property.description.slice(0, 157)}...` : property.description}
        path={`/nha/${propertySlug(property.name, property.id)}`}
        image={property.images[0]}
        type="website"
        jsonLd={[
          {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Trang chủ', item: 'https://resortregistry.vercel.app/' },
              { '@type': 'ListItem', position: 2, name: 'Danh sách', item: 'https://resortregistry.vercel.app/danh-sach-nha' },
              { '@type': 'ListItem', position: 3, name: property.name, item: `https://resortregistry.vercel.app/nha/${propertySlug(property.name, property.id)}` },
            ],
          },
        ]}
      />
      <div className="min-h-screen bg-cream">
      {/* Breadcrumb */}
      <div className="bg-navy/5 border-b border-cream-dark">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-2 text-sm text-muted">
          <button onClick={() => navigate('home')} className="hover:text-navy">Trang Chủ</button>
          <span>/</span>
          <button onClick={() => navigate('listings')} className="hover:text-navy">Danh Sách</button>
          <span>/</span>
          <span className="text-navy">{property.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${
                property.status === 'available' ? 'bg-success/10 text-success border border-success/20' :
                property.status === 'booked' ? 'bg-warning/10 text-warning border border-warning/20' :
                'bg-muted/10 text-muted border border-muted/20'
              }`}>
                {property.status === 'available' ? '✓ Còn Trống' : property.status === 'booked' ? '⏳ Đã Đặt' : '🔧 Bảo Trì'}
              </span>
              <span className="text-xs text-muted bg-cream-dark px-3 py-1 rounded-full capitalize">{property.type}</span>
            </div>
            <h1 className="font-display text-3xl text-navy font-semibold">{property.name}</h1>
            <p className="text-muted mt-1 flex items-center gap-1">
              📍 {property.resort} · {property.location}, {property.province}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right">
            {isBuy ? (
              <>
                <span className="font-display text-3xl text-navy font-semibold">
                  {property.price >= 1000 ? `${(property.price / 1000).toLocaleString('vi-VN')}` : property.price}
                </span>
                <span className="text-muted ml-1">{property.price >= 1000 ? 'tỷ VNĐ' : 'triệu VNĐ'} — Giá bán</span>
              </>
            ) : (
              <>
                <span className="font-display text-3xl text-navy font-semibold">{property.price}</span>
                <span className="text-muted ml-1">triệu VNĐ/tháng</span>
              </>
            )}
            <span className={`ml-3 text-xs font-semibold px-3 py-1 rounded-full ${
              isBuy ? 'bg-gold/15 text-gold-dark' : 'bg-teal/10 text-teal'
            }`}>
              {isBuy ? '🏠 Đang bán' : '🔑 Cho thuê'}
            </span>
          </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Images + Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="space-y-3">
              <div className="relative rounded-2xl overflow-hidden h-80 bg-navy/5">
                <img
                  src={property.images[selectedImage]}
                  alt={property.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4 flex items-center gap-1 bg-white/90 backdrop-blur rounded-full px-3 py-1.5">
                  <span className="text-gold">★</span>
                  <span className="font-semibold text-navy text-sm">{property.rating}</span>
                  <span className="text-muted text-xs">({property.reviews} đánh giá)</span>
                </div>
              </div>
              <div className="flex gap-3">
                {property.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`relative flex-1 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                      selectedImage === i ? 'border-gold shadow-md' : 'border-transparent hover:border-gold/40'
                    }`}
                  >
                    <img src={img} alt={`${property.name} - ảnh ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { icon: '🛏', label: 'Phòng Ngủ', val: `${property.bedrooms} phòng` },
                { icon: '🚿', label: 'Phòng Tắm', val: `${property.bathrooms} phòng` },
                { icon: '📐', label: 'Diện Tích', val: `${property.area} m²` },
                { icon: '🏢', label: 'Loại', val: property.type.charAt(0).toUpperCase() + property.type.slice(1) },
              ].map(s => (
                <div key={s.label} className="bg-white rounded-xl p-4 text-center">
                  <p className="text-2xl mb-1">{s.icon}</p>
                  <p className="text-xs text-muted">{s.label}</p>
                  <p className="font-semibold text-navy text-sm mt-0.5">{s.val}</p>
                </div>
              ))}
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl p-6">
              <h2 className="font-display text-xl text-navy font-semibold mb-3">Mô Tả</h2>
              <p className="text-navy/70 leading-relaxed">{property.description}</p>
            </div>

            {/* Amenities */}
            <div className="bg-white rounded-2xl p-6">
              <h2 className="font-display text-xl text-navy font-semibold mb-4">Tiện Nghi</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {property.amenities.map(a => (
                  <div key={a} className="flex items-center gap-2 text-sm text-navy bg-cream rounded-lg px-3 py-2">
                    <span>{amenityIcons[a] || '✓'}</span>
                    <span>{a}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Location */}
            <div className="bg-white rounded-2xl p-6">
              <h2 className="font-display text-xl text-navy font-semibold mb-3">Vị Trí</h2>
              <p className="text-muted text-sm mb-3">📍 {property.location}, {property.province}, Việt Nam</p>
              <div className="bg-cream-dark rounded-xl h-40 flex items-center justify-center">
                <div className="text-center text-muted">
                  <p className="text-3xl mb-2">🗺</p>
                  <p className="text-sm">Bản đồ sẽ hiển thị ở đây</p>
                  <p className="text-xs mt-1">{property.resort}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right panel: nhà bán → liên hệ; nhà thuê → đăng ký đặt chỗ */}
          <div className="lg:col-span-1">
            {isBuy ? (
              <div className="bg-white rounded-2xl p-6 shadow-lg sticky top-20 border border-gold/30">
                <h2 className="font-display text-xl text-navy font-semibold mb-1">Thông Tin Mua Bán</h2>
                <p className="text-muted text-sm mb-5">Tài sản này đang được rao bán nguyên căn</p>

                <div className="bg-gold/10 border border-gold/20 rounded-xl p-4 mb-5">
                  <p className="text-xs text-muted mb-1">Giá bán</p>
                  <p className="font-display text-3xl text-navy font-semibold">
                    {property.price >= 1000 ? `${(property.price / 1000).toLocaleString('vi-VN')} tỷ` : `${property.price} triệu`}
                  </p>
                  <p className="text-xs text-muted mt-1">≈ {property.price.toLocaleString('vi-VN')} triệu VNĐ</p>
                </div>

                <button
                  onClick={openAppointment}
                  className="w-full py-3.5 mb-5 rounded-xl bg-navy text-gold font-semibold text-sm hover:bg-navy-light transition-colors shadow-lg hover:shadow-navy/20"
                >
                  📅 Đặt Lịch Xem Nhà
                </button>

                <div className="space-y-2 text-sm mb-5">
                  {[
                    { label: 'Diện tích', val: `${property.area} m²` },
                    { label: 'Phòng ngủ / WC', val: `${property.bedrooms} PN · ${property.bathrooms} WC` },
                    { label: 'Vị trí', val: `${property.location}, ${property.province}` },
                  ].map(row => (
                    <div key={row.label} className="flex justify-between">
                      <span className="text-muted">{row.label}</span>
                      <span className="text-navy font-medium">{row.val}</span>
                    </div>
                  ))}
                </div>

                <div className="bg-cream rounded-xl p-4 text-sm text-navy/80 space-y-2">
                  <p className="font-semibold text-navy">💬 Cách thức giao dịch</p>
                  <p>Tài sản bán không đặt chỗ online. Vui lòng bấm nút chat <strong>💬</strong> ở góc phải dưới màn hình để trao đổi trực tiếp với nhân viên phụ trách: xem nhà, thương lượng giá và thủ tục pháp lý.</p>
                </div>

                <div className="mt-4 pt-4 border-t border-cream-dark">
                  <div className="flex items-center gap-2 text-xs text-muted">
                    <span>✓</span>
                    <span>Sổ hồng lâu dài, pháp lý minh bạch</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted mt-1">
                    <span>✓</span>
                    <span>Hỗ trợ xem nhà tận nơi trong 24 giờ</span>
                  </div>
                </div>
              </div>
            ) : (
            <div className="bg-white rounded-2xl p-6 shadow-lg sticky top-20 border border-cream-dark">
              <h2 className="font-display text-xl text-navy font-semibold mb-1">Đăng Ký Đặt Chỗ</h2>
              <p className="text-muted text-sm mb-5">Kiểm tra tình trạng khả dụng</p>

              {/* Months selector */}
              <div className="mb-4">
                <label className="text-xs font-semibold text-muted uppercase tracking-wide mb-2 block">
                  Thời Gian Thuê
                </label>
                <div className="flex gap-2 flex-wrap">
                  {[1, 3, 6, 12].map(m => (
                    <button
                      key={m}
                      onClick={() => setMonths(m)}
                      className={`px-3 py-2 rounded-lg text-sm font-semibold border transition-all ${
                        months === m ? 'bg-navy text-gold border-navy' : 'border-cream-dark text-muted hover:border-navy/30 hover:text-navy'
                      }`}
                    >
                      {m} tháng
                    </button>
                  ))}
                </div>
              </div>

              {/* Start date */}
              <div className="mb-4">
                <label className="text-xs font-semibold text-muted uppercase tracking-wide mb-2 block">
                  Ngày Bắt Đầu
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={e => { setStartDate(e.target.value); setAvailable(null); }}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2.5 text-sm rounded-lg border border-cream-dark text-navy bg-cream"
                />
              </div>

              {/* Availability check */}
              <button
                onClick={checkAvailability}
                disabled={!startDate || checkingAvail}
                className="w-full py-2.5 rounded-lg text-sm font-semibold border border-teal text-teal hover:bg-teal hover:text-cream transition-all mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {checkingAvail ? 'Đang Kiểm Tra...' : 'Kiểm Tra Khả Dụng'}
              </button>

              {available !== null && (
                <div className={`p-3 rounded-lg text-sm mb-4 ${available ? 'bg-success/10 text-success border border-success/20' : 'bg-error/10 text-error border border-error/20'}`}>
                  {available ? '✓ Có thể đặt! Nhấn bên dưới để tiến hành.' : '✗ Không khả dụng trong thời gian này.'}
                </div>
              )}

              {/* Fee breakdown */}
              <div className="bg-cream rounded-xl p-4 mb-5 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Tiền thuê ({months} tháng)</span>
                  <span className="font-mono-data text-navy">{basePrice.toFixed(0)} tr</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Phí xử lý (5%)</span>
                  <span className="font-mono-data text-navy">{processingFee.toFixed(1)} tr</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Đặt cọc (1 tháng)</span>
                  <span className="font-mono-data text-navy">{deposit} tr</span>
                </div>
                <hr className="border-cream-dark" />
                <div className="flex justify-between font-semibold">
                  <span className="text-navy">Tổng Cộng</span>
                  <span className="font-display text-navy text-lg">{total.toFixed(1)} tr</span>
                </div>
              </div>

              <button
                onClick={handleBooking}
                disabled={property.status !== 'available'}
                className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all ${
                  property.status === 'available'
                    ? 'bg-navy text-gold hover:bg-navy-light shadow-lg hover:shadow-navy/20'
                    : 'bg-cream-dark text-muted cursor-not-allowed'
                }`}
              >
                {property.status === 'available' ? 'Tiến Hành Đăng Ký' : 'Không Khả Dụng'}
              </button>

              {!currentUser && (
                <p className="text-xs text-muted text-center mt-3">
                  Cần <button onClick={() => navigate('login')} className="text-teal hover:text-navy">đăng nhập</button> để đặt chỗ
                </p>
              )}

              <button
                onClick={openAppointment}
                className="w-full mt-3 py-2.5 rounded-xl border border-navy/20 text-navy text-sm font-semibold hover:border-navy/40 transition-colors"
              >
                📅 Hoặc đặt lịch xem nhà trước
              </button>

              <div className="mt-4 pt-4 border-t border-cream-dark">
                <div className="flex items-center gap-2 text-xs text-muted">
                  <span>🔒</span>
                  <span>Thanh toán bảo mật SSL 256-bit</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted mt-1">
                  <span>✓</span>
                  <span>Hoàn tiền đặt cọc khi hết hợp đồng</span>
                </div>
              </div>
            </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal đặt lịch xem nhà */}
      {showAppointment && (
        <div className="fixed inset-0 bg-navy/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowAppointment(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-fadeIn" onClick={e => e.stopPropagation()}>
            {apptSuccess ? (
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-success/10 border-2 border-success flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">✓</span>
                </div>
                <h3 className="font-display text-xl text-navy font-semibold mb-2">Đã Gửi Yêu Cầu Lịch Hẹn!</h3>
                <p className="text-muted text-sm mb-2">
                  {new Date(`${apptDate}T${apptTime}`).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
                <p className="text-muted text-sm mb-5">Nhân viên phụ trách sẽ liên hệ xác nhận với bạn trong thời gian sớm nhất. Theo dõi trạng thái ở trang <strong className="text-navy">Tài Khoản → Lịch Hẹn Xem Nhà</strong>.</p>
                <button
                  onClick={() => setShowAppointment(false)}
                  className="w-full py-2.5 rounded-xl bg-navy text-gold font-semibold text-sm hover:bg-navy-light transition-colors"
                >
                  Đóng
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-display text-xl text-navy font-semibold">Đặt Lịch Xem Nhà</h3>
                  <button onClick={() => setShowAppointment(false)} className="text-muted hover:text-navy text-2xl leading-none">×</button>
                </div>

                {apptError && (
                  <div className="mb-4 p-3 rounded-xl bg-error/10 border border-error/20 text-error text-sm">{apptError}</div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-muted uppercase tracking-wide mb-1.5 block">Tài Sản</label>
                    <p className="text-navy text-sm px-4 py-2.5 bg-cream rounded-lg">{property.name} · {property.province}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-muted uppercase tracking-wide mb-1.5 block">Ngày Hẹn</label>
                      <input
                        type="date"
                        value={apptDate}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={e => setApptDate(e.target.value)}
                        className="w-full px-3 py-2.5 text-sm rounded-lg border border-cream-dark text-navy bg-cream"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted uppercase tracking-wide mb-1.5 block">Giờ Hẹn</label>
                      <select
                        value={apptTime}
                        onChange={e => setApptTime(e.target.value)}
                        className="w-full px-3 py-2.5 text-sm rounded-lg border border-cream-dark text-navy bg-cream cursor-pointer"
                      >
                        {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted uppercase tracking-wide mb-1.5 block">Nội Dung Hẹn</label>
                    <textarea
                      value={apptReason}
                      onChange={e => setApptReason(e.target.value)}
                      rows={3}
                      placeholder="Ví dụ: muốn xem nhà, tư vấn pháp lý, thương lượng giá..."
                      className="w-full px-3 py-2.5 text-sm rounded-lg border border-cream-dark text-navy bg-cream resize-none"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-5">
                  <button
                    onClick={submitAppointment}
                    disabled={apptSubmitting}
                    className="flex-1 py-2.5 rounded-xl bg-navy text-gold font-semibold text-sm hover:bg-navy-light transition-colors disabled:opacity-60"
                  >
                    {apptSubmitting ? 'Đang Gửi...' : 'Gửi Yêu Cầu'}
                  </button>
                  <button onClick={() => setShowAppointment(false)} className="flex-1 py-2.5 rounded-xl border border-cream-dark text-navy font-semibold text-sm hover:border-navy/40 transition-colors">
                    Hủy
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
    </>
  );
}
