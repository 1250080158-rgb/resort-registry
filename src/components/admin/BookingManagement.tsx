import { useEffect, useState } from 'react';
import { Booking as MockBooking, BookingStatus } from '../../data/mockData';
import { bookingApi, paymentApi } from '../../utils/api';
import { transformBookings } from '../../utils/dataTransform';
import { bookingReportHtml, exportHtmlToPdf } from '../../utils/pdfExport';
import { exportToExcel } from '../../utils/excelExport';
import Pagination from '../shared/Pagination';

const statusConfig: Record<BookingStatus, { label: string; color: string }> = {
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

export default function BookingManagement() {
  const [bookings, setBookings] = useState<MockBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<MockBooking | null>(null);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 8;

  // Đổi bộ lọc/tìm kiếm → quay về trang 1
  useEffect(() => { setPage(1); }, [filterStatus, search]);

  const loadBookings = async () => {
    try {
      const data = await bookingApi.getAll();
      setBookings(transformBookings(data));
    } catch {
      alert('Không tải được danh sách đặt chỗ. Kiểm tra backend đã chạy ở cổng 8080.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadBookings(); }, []);

  const filtered = bookings.filter(b => {
    if (filterStatus !== 'all' && b.status !== filterStatus) return false;
    if (search && !b.propertyName.toLowerCase().includes(search.toLowerCase()) && !b.userName.toLowerCase().includes(search.toLowerCase()) && !b.id.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const updateStatus = async (id: string, status: BookingStatus) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b)); // optimistic
    if (selectedBooking?.id === id) setSelectedBooking(prev => prev ? { ...prev, status } : null);
    try {
      await bookingApi.updateStatus(Number(id), status.toUpperCase());
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Cập nhật trạng thái thất bại');
      await loadBookings(); // hoàn tác optimistic update
    }
  };

  // Xuất PDF thật (render HTML → canvas → file .pdf)
  const handleDownload = async (booking: MockBooking) => {
    try {
      await exportHtmlToPdf(
        bookingReportHtml({
          id: booking.id,
          createdAt: booking.createdAt,
          propertyName: booking.propertyName,
          resort: booking.resort,
          userName: booking.userName,
          userEmail: booking.userEmail,
          userPhone: booking.userPhone,
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
          notes: booking.notes,
        }),
        `booking-${booking.id}-admin.pdf`,
      );
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Xuất PDF thất bại');
    }
  };

  // Xuất danh sách đang lọc ra file Excel .xlsx
  const handleExportExcel = () => {
    exportToExcel(filtered.map(b => ({
      'Mã đặt chỗ': b.id,
      'Ngày tạo': b.createdAt,
      'Người đặt': b.userName,
      'Email': b.userEmail,
      'SĐT': b.userPhone,
      'Tài sản': b.propertyName,
      'Khu nghỉ dưỡng': b.resort,
      'Bắt đầu': b.startDate,
      'Kết thúc': b.endDate,
      'Thời hạn (tháng)': b.months,
      'Tiền thuê (triệu)': b.basePrice,
      'Phí xử lý (triệu)': b.processingFee,
      'Đặt cọc (triệu)': b.deposit,
      'Tổng cộng (triệu)': b.totalPrice,
      'Trạng thái': statusConfig[b.status].label,
      'Thanh toán': paymentConfig[b.paymentStatus].label,
      'Phương thức': b.paymentMethod || '',
      'Ghi chú': b.notes || '',
    })), 'Đặt chỗ', `booking-${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const handleRefund = async () => {
    if (!selectedBooking) return;
    if (!window.confirm(`Xác nhận hoàn tiền cho đặt chỗ #${selectedBooking.id}? Giao dịch thành công mới nhất sẽ chuyển sang REFUNDED.`)) return;
    try {
      await paymentApi.refund(Number(selectedBooking.id));
      await loadBookings();
      setSelectedBooking(null);
      alert('Hoàn tiền thành công');
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Hoàn tiền thất bại');
    }
  };

  const handleConfirmPayment = async () => {
    if (!selectedBooking) return;
    // Get pending payment transaction for this booking
    try {
      const transactions = await paymentApi.getByBooking(Number(selectedBooking.id));
      const pendingTx = transactions.find(t => t.status === 'PENDING');
      if (!pendingTx) {
        alert('Không tìm thấy giao dịch đang chờ xác nhận');
        return;
      }
      if (!window.confirm(`Xác nhận thanh toán cho đặt chỗ #${selectedBooking.id}?`)) return;
      await paymentApi.confirmPayment(pendingTx.id);
      await loadBookings();
      setSelectedBooking(null);
      alert('Xác nhận thanh toán thành công');
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Xác nhận thanh toán thất bại');
    }
  };

  const totalRevenue = filtered.reduce((s, b) => b.paymentStatus === 'paid' ? s + b.totalPrice : s, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-3 border-gold/30 border-t-gold rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl text-navy font-semibold">Quản Lý Đặt Chỗ</h2>
          <p className="text-muted text-sm mt-0.5">{bookings.length} tổng đơn đặt chỗ</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handleExportExcel}
            disabled={filtered.length === 0}
            className="text-xs font-semibold text-teal border border-teal/30 px-4 py-2.5 rounded-xl hover:bg-teal/5 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            ⬇ Xuất Excel
          </button>
          <div className="text-right">
            <p className="font-display text-2xl text-navy font-semibold">{totalRevenue.toFixed(0)} tr</p>
            <p className="text-xs text-muted">Doanh thu đã thu</p>
          </div>
        </div>
      </div>

      {/* Status summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {(['confirmed', 'pending', 'completed', 'cancelled'] as BookingStatus[]).map(s => (
          <div key={s} className={`rounded-xl p-4 border ${statusConfig[s].color}`}>
            <p className="font-display text-2xl font-semibold">{bookings.filter(b => b.status === s).length}</p>
            <p className="text-xs mt-0.5">{statusConfig[s].label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-cream-dark flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Tìm theo mã, tên nhà, người dùng..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 min-w-48 px-4 py-2 text-sm rounded-xl border border-cream-dark text-navy bg-cream"
        />
        <div className="flex flex-wrap gap-2">
          {[
            { val: 'all', label: 'Tất Cả' },
            { val: 'pending', label: 'Chờ Duyệt' },
            { val: 'confirmed', label: 'Đã Xác Nhận' },
            { val: 'completed', label: 'Hoàn Thành' },
            { val: 'cancelled', label: 'Đã Hủy' },
          ].map(f => (
            <button key={f.val} onClick={() => setFilterStatus(f.val)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${filterStatus === f.val ? 'bg-navy text-gold' : 'border border-cream-dark text-navy hover:border-navy/30'}`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-cream-dark overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-cream border-b border-cream-dark">
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase">Mã ĐC</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase">Người Đặt</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase">Tài Sản</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase">Thời Gian</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase">Tổng Tiền</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase">TT Đặt Chỗ</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase">TT Thanh Toán</th>
                <th className="px-5 py-3 text-xs font-semibold text-muted uppercase text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((booking, i) => (
                <tr key={booking.id} className={`border-b border-cream-dark hover:bg-cream/40 transition-colors cursor-pointer ${i % 2 === 1 ? 'bg-cream/20' : ''}`} onClick={() => setSelectedBooking(booking)}>
                  <td className="px-5 py-3">
                    <p className="font-mono-data text-navy text-xs font-bold">#{booking.id}</p>
                    <p className="text-muted text-xs">{booking.createdAt}</p>
                  </td>
                  <td className="px-5 py-3">
                    <p className="text-navy text-sm font-medium">{booking.userName}</p>
                    <p className="text-muted text-xs truncate max-w-32">{booking.userEmail}</p>
                  </td>
                  <td className="px-5 py-3">
                    <p className="text-navy text-sm line-clamp-1">{booking.propertyName}</p>
                    <p className="text-muted text-xs">{booking.resort}</p>
                  </td>
                  <td className="px-5 py-3 text-xs">
                    <p className="font-mono-data text-navy">{booking.startDate}</p>
                    <p className="font-mono-data text-muted">{booking.endDate}</p>
                    <p className="text-muted">{booking.months} tháng</p>
                  </td>
                  <td className="px-5 py-3">
                    <span className="font-display font-semibold text-navy">{booking.totalPrice}</span>
                    <span className="text-xs text-muted ml-1">tr</span>
                  </td>
                  <td className="px-5 py-3" onClick={e => e.stopPropagation()}>
                    <select
                      value={booking.status}
                      onChange={e => updateStatus(booking.id, e.target.value as BookingStatus)}
                      className={`text-xs font-semibold px-2 py-1 rounded-full border cursor-pointer bg-transparent ${statusConfig[booking.status].color}`}
                    >
                      <option value="pending">Chờ Duyệt</option>
                      <option value="confirmed">Xác Nhận</option>
                      <option value="completed">Hoàn Thành</option>
                      <option value="cancelled">Đã Hủy</option>
                    </select>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-semibold ${paymentConfig[booking.paymentStatus].color}`}>
                      {paymentConfig[booking.paymentStatus].label}
                    </span>
                  </td>
                  <td className="px-5 py-3" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => setSelectedBooking(booking)} className="text-xs text-teal hover:text-navy border border-teal/30 hover:border-navy/30 px-2.5 py-1.5 rounded-lg transition-all">
                        Chi Tiết
                      </button>
                      <button onClick={() => handleDownload(booking)} className="text-xs text-muted border border-muted/30 px-2.5 py-1.5 rounded-lg hover:border-navy/30 hover:text-navy transition-all">
                        PDF
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-muted">
              <p className="text-2xl mb-2">📭</p>
              <p className="text-sm">Không tìm thấy đặt chỗ nào</p>
            </div>
          )}
          <Pagination page={safePage} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </div>

      {/* Detail modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-navy/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedBooking(null)}>
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-fadeIn max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display text-xl text-navy font-semibold">Chi Tiết Đặt Chỗ</h3>
              <button onClick={() => setSelectedBooking(null)} className="text-muted hover:text-navy text-2xl leading-none">×</button>
            </div>

            <div className="space-y-4 text-sm">
              <div className="bg-cream rounded-xl p-4">
                <p className="text-xs text-muted">{selectedBooking.resort}</p>
                <p className="font-display text-navy font-semibold text-lg">{selectedBooking.propertyName}</p>
                <p className="font-mono-data text-muted text-xs mt-1">#{selectedBooking.id}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-cream rounded-xl p-3">
                  <p className="text-xs text-muted mb-0.5">Người Đặt</p>
                  <p className="font-semibold text-navy">{selectedBooking.userName}</p>
                  <p className="text-xs text-muted">{selectedBooking.userEmail}</p>
                </div>
                <div className="bg-cream rounded-xl p-3">
                  <p className="text-xs text-muted mb-0.5">Thời Hạn</p>
                  <p className="font-semibold text-navy">{selectedBooking.months} tháng</p>
                  <p className="text-xs font-mono-data text-muted">{selectedBooking.startDate} →</p>
                </div>
              </div>

              <div className="space-y-2">
                {[
                  { l: 'Tiền Thuê', v: `${selectedBooking.basePrice} tr` },
                  { l: 'Phí Xử Lý', v: `${selectedBooking.processingFee} tr` },
                  { l: 'Đặt Cọc', v: `${selectedBooking.deposit} tr` },
                ].map(r => (
                  <div key={r.l} className="flex justify-between">
                    <span className="text-muted">{r.l}</span>
                    <span className="font-mono-data text-navy">{r.v}</span>
                  </div>
                ))}
                <hr className="border-cream-dark" />
                <div className="flex justify-between font-bold text-base">
                  <span className="text-navy">Tổng Cộng</span>
                  <span className="font-display text-navy">{selectedBooking.totalPrice} tr</span>
                </div>
              </div>

              <div className="flex gap-2">
                <span className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${statusConfig[selectedBooking.status].color}`}>
                  {statusConfig[selectedBooking.status].label}
                </span>
                <span className={`text-xs font-semibold px-3 py-1.5 rounded-full bg-cream ${paymentConfig[selectedBooking.paymentStatus].color}`}>
                  {paymentConfig[selectedBooking.paymentStatus].label}
                </span>
              </div>

              {selectedBooking.notes && (
                <div className="bg-amber-50 border border-warning/20 rounded-xl p-3">
                  <p className="text-xs text-muted mb-1">Ghi Chú</p>
                  <p className="text-navy text-sm">{selectedBooking.notes}</p>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-5">
              <button onClick={() => handleDownload(selectedBooking)} className="flex-1 py-2.5 rounded-xl bg-navy text-gold font-semibold text-sm hover:bg-navy-light transition-colors">
                📄 Tải Xuống PDF
              </button>
              {selectedBooking.paymentStatus === 'paid' && (
                <button onClick={handleRefund} className="flex-1 py-2.5 rounded-xl bg-error text-cream font-semibold text-sm hover:bg-error/90 transition-colors">
                  ↩ Hoàn Tiền
                </button>
              )}
              {selectedBooking.paymentStatus === 'unpaid' && (
                <button onClick={handleConfirmPayment} className="flex-1 py-2.5 rounded-xl bg-success text-cream font-semibold text-sm hover:bg-success/90 transition-colors">
                  ✓ Xác Nhận Thanh Toán
                </button>
              )}
              <button onClick={() => setSelectedBooking(null)} className="flex-1 py-2.5 rounded-xl border border-cream-dark text-navy font-semibold text-sm transition-colors">
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
