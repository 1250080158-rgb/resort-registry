import { useEffect, useState } from 'react';
import { View, Booking } from '../../data/mockData';
import { bookingApi } from '../../utils/api';
import { transformBookings } from '../../utils/dataTransform';
import { bookingReceiptHtml, exportHtmlToPdf } from '../../utils/pdfExport';

interface BookingHistoryPageProps {
  navigate: (view: View) => void;
  userId?: number;
}

const statusConfig = {
  confirmed: { label: 'Đã Xác Nhận', color: 'bg-success/10 text-success border-success/20' },
  pending: { label: 'Đang Chờ', color: 'bg-warning/10 text-warning border-warning/20' },
  completed: { label: 'Hoàn Thành', color: 'bg-teal/10 text-teal border-teal/20' },
  cancelled: { label: 'Đã Hủy', color: 'bg-error/10 text-error border-error/20' },
};

const paymentConfig = {
  paid: { label: 'Đã Thanh Toán', color: 'text-success' },
  unpaid: { label: 'Chưa Thanh Toán', color: 'text-warning' },
  refunded: { label: 'Đã Hoàn Tiền', color: 'text-teal' },
};

export default function BookingHistoryPage({ navigate, userId }: BookingHistoryPageProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const loadBookings = () => {
    if (!userId) { setLoading(false); return; }
    bookingApi.getByUserId(userId)
      .then(data => setBookings(transformBookings(data)))
      .catch(() => setBookings([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadBookings(); }, [userId]);

  // User tự hủy đặt chỗ của mình (backend chỉ cho phép CANCELLED trên đơn của chính mình)
  const handleCancel = async (booking: Booking) => {
    if (!window.confirm(`Hủy đặt chỗ #${booking.id} — ${booking.propertyName}? Phí xử lý không được hoàn theo chính sách hủy.`)) return;
    try {
      await bookingApi.updateStatus(Number(booking.id), 'CANCELLED');
      setBookings(prev => prev.map(b => b.id === booking.id ? { ...b, status: 'cancelled' as const } : b));
      setSelectedBooking(null);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Hủy đặt chỗ thất bại');
    }
  };

  const filtered = bookings.filter(b => {
    if (filterStatus !== 'all' && b.status !== filterStatus) return false;
    if (search && !b.propertyName.toLowerCase().includes(search.toLowerCase()) && !b.id.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // Xuất biên nhận PDF thật (render HTML → canvas → file .pdf)
  const handleDownload = async (booking: Booking) => {
    try {
      await exportHtmlToPdf(
        bookingReceiptHtml({
          id: booking.id,
          createdAt: booking.createdAt,
          propertyName: booking.propertyName,
          resort: booking.resort,
          startDate: booking.startDate,
          endDate: booking.endDate,
          months: booking.months,
          basePrice: booking.basePrice,
          processingFee: booking.processingFee,
          deposit: booking.deposit,
          totalPrice: booking.totalPrice,
          statusLabel: statusConfig[booking.status].label,
          paymentLabel: paymentConfig[booking.paymentStatus].label,
          paymentMethod: booking.paymentMethod,
        }),
        `bien-nhan-dat-cho-${booking.id}.pdf`,
      );
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Xuất PDF thất bại');
    }
  };

  return (
    <div className="min-h-screen bg-cream">
      <div className="bg-navy py-10 px-6">
        <div className="max-w-6xl mx-auto">
          <button onClick={() => navigate('profile')} className="text-cream/60 hover:text-gold text-sm mb-4 flex items-center gap-1">
            ← Tài Khoản
          </button>
          <p className="text-gold text-xs tracking-widest uppercase mb-1">Tài Khoản</p>
          <h1 className="font-display text-3xl text-cream font-semibold">Lịch Sử Đặt Chỗ</h1>
          <p className="text-cream/60 text-sm mt-1">{bookings.length} đơn đặt chỗ trong tổng lịch sử</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            type="text"
            placeholder="Tìm theo mã đặt chỗ hoặc tên nhà..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 px-4 py-2.5 text-sm rounded-xl border border-cream-dark text-navy bg-white"
          />
          <div className="flex gap-2 flex-wrap">
            {[
              { val: 'all', label: 'Tất Cả' },
              { val: 'confirmed', label: 'Xác Nhận' },
              { val: 'pending', label: 'Chờ Duyệt' },
              { val: 'completed', label: 'Hoàn Thành' },
              { val: 'cancelled', label: 'Đã Hủy' },
            ].map(f => (
              <button
                key={f.val}
                onClick={() => setFilterStatus(f.val)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  filterStatus === f.val ? 'bg-navy text-gold' : 'bg-white text-navy border border-cream-dark hover:border-navy/30'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Tổng Đặt Chỗ', val: bookings.length, icon: '📋', color: 'text-navy' },
            { label: 'Đã Xác Nhận', val: bookings.filter(b => b.status === 'confirmed').length, icon: '✓', color: 'text-success' },
            { label: 'Hoàn Thành', val: bookings.filter(b => b.status === 'completed').length, icon: '🏆', color: 'text-teal' },
            { label: 'Tổng Chi Tiêu', val: `${bookings.reduce((s, b) => s + b.totalPrice, 0).toFixed(0)} tr`, icon: '💰', color: 'text-gold' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl p-4 border border-cream-dark">
              <div className="flex items-center justify-between mb-1">
                <span className="text-lg">{s.icon}</span>
                <span className={`font-display text-2xl font-semibold ${s.color}`}>{s.val}</span>
              </div>
              <p className="text-xs text-muted">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-3 border-gold/30 border-t-gold rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 text-center shadow-sm">
            <p className="text-4xl mb-4">📭</p>
            <p className="font-display text-xl text-navy mb-2">Không có đặt chỗ nào</p>
            <button onClick={() => navigate('listings')} className="mt-4 bg-navy text-gold px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-navy-light transition-colors">
              Tìm Nhà Ngay
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-cream-dark">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-cream border-b border-cream-dark">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wide">Mã Đặt Chỗ</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wide">Tài Sản</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wide">Thời Gian</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wide">Tổng Tiền</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wide">Trạng Thái</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wide">Thanh Toán</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((booking, i) => (
                    <tr
                      key={booking.id}
                      className={`border-b border-cream-dark hover:bg-cream/50 transition-colors cursor-pointer ${i % 2 === 1 ? 'bg-cream/30' : ''}`}
                      onClick={() => setSelectedBooking(booking)}
                    >
                      <td className="px-5 py-4">
                        <span className="font-mono-data text-navy text-xs font-semibold">{booking.id}</span>
                        <p className="text-xs text-muted mt-0.5">{booking.createdAt}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-navy font-medium text-sm line-clamp-1">{booking.propertyName}</p>
                        <p className="text-muted text-xs">{booking.resort}</p>
                      </td>
                      <td className="px-5 py-4 text-xs text-navy">
                        <p className="font-mono-data">{booking.startDate}</p>
                        <p className="font-mono-data text-muted">{booking.endDate}</p>
                        <p className="text-muted mt-0.5">{booking.months} tháng</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-display font-semibold text-navy">{booking.totalPrice}</span>
                        <span className="text-muted text-xs ml-1">tr</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${statusConfig[booking.status].color}`}>
                          {statusConfig[booking.status].label}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-xs font-semibold ${paymentConfig[booking.paymentStatus].color}`}>
                          {paymentConfig[booking.paymentStatus].label}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={e => { e.stopPropagation(); handleDownload(booking); }}
                            className="text-xs text-teal hover:text-navy font-medium border border-teal/30 hover:border-navy/30 px-3 py-1.5 rounded-lg transition-all"
                          >
                            📄 PDF
                          </button>
                          {(booking.status === 'pending' || booking.status === 'confirmed') && (
                            <button
                              onClick={e => { e.stopPropagation(); handleCancel(booking); }}
                              className="text-xs text-error hover:text-error/80 font-medium border border-error/30 px-3 py-1.5 rounded-lg hover:bg-error/5 transition-all"
                            >
                              Hủy
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Detail modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-navy/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedBooking(null)}>
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-fadeIn" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display text-xl text-navy font-semibold">Chi Tiết Đặt Chỗ</h3>
              <button onClick={() => setSelectedBooking(null)} className="text-muted hover:text-navy text-xl">×</button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="bg-cream rounded-xl p-4">
                <p className="text-muted text-xs mb-0.5">{selectedBooking.resort}</p>
                <p className="font-display text-navy font-semibold">{selectedBooking.propertyName}</p>
              </div>
              {[
                { label: 'Mã Đặt Chỗ', val: selectedBooking.id, mono: true },
                { label: 'Ngày Tạo', val: selectedBooking.createdAt },
                { label: 'Nhận Phòng', val: selectedBooking.startDate, mono: true },
                { label: 'Trả Phòng', val: selectedBooking.endDate, mono: true },
                { label: 'Thời Hạn', val: `${selectedBooking.months} tháng` },
                { label: 'Phương Thức TT', val: selectedBooking.paymentMethod },
              ].map(row => (
                <div key={row.label} className="flex justify-between">
                  <span className="text-muted">{row.label}</span>
                  <span className={`text-navy font-medium ${row.mono ? 'font-mono-data text-xs' : ''}`}>{row.val}</span>
                </div>
              ))}
              <hr className="border-cream-dark" />
              <div className="flex justify-between">
                <span className="text-muted">Tiền thuê</span>
                <span className="text-navy">{selectedBooking.basePrice} tr</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Phí xử lý</span>
                <span className="text-navy">{selectedBooking.processingFee} tr</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Đặt cọc</span>
                <span className="text-navy">{selectedBooking.deposit} tr</span>
              </div>
              <hr className="border-cream-dark" />
              <div className="flex justify-between font-bold text-base">
                <span className="text-navy">Tổng Cộng</span>
                <span className="font-display text-navy">{selectedBooking.totalPrice} tr</span>
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button
                onClick={() => handleDownload(selectedBooking)}
                className="flex-1 py-2.5 rounded-xl bg-navy text-gold font-semibold text-sm hover:bg-navy-light transition-colors"
              >
                📄 Tải Xuống PDF
              </button>
              {(selectedBooking.status === 'pending' || selectedBooking.status === 'confirmed') && (
                <button
                  onClick={() => handleCancel(selectedBooking)}
                  className="flex-1 py-2.5 rounded-xl bg-error text-cream font-semibold text-sm hover:bg-error/90 transition-colors"
                >
                  Hủy Đặt Chỗ
                </button>
              )}
              <button
                onClick={() => setSelectedBooking(null)}
                className="flex-1 py-2.5 rounded-xl border border-cream-dark text-navy font-semibold text-sm hover:border-navy/40 transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
