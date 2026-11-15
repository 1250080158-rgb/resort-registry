import { useEffect, useState } from 'react';
import { Appointment, appointmentApi } from '../../utils/api';
import { exportToExcel } from '../../utils/excelExport';
import Pagination from '../shared/Pagination';

const statusConfig: Record<Appointment['status'], { label: string; color: string }> = {
  PENDING: { label: 'Chờ Xác Nhận', color: 'bg-warning/10 text-warning border-warning/20' },
  CONFIRMED: { label: 'Đã Xác Nhận', color: 'bg-success/10 text-success border-success/20' },
  COMPLETED: { label: 'Hoàn Thành', color: 'bg-teal/10 text-teal border-teal/20' },
  CANCELLED: { label: 'Đã Hủy', color: 'bg-error/10 text-error border-error/20' },
};

const formatDateTime = (iso: string) => {
  if (!iso) return '--';
  const d = new Date(iso);
  return d.toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

/**
 * Quản lý lịch hẹn xem nhà: xem toàn bộ, lọc theo trạng thái,
 * xác nhận/hủy/hoàn thành và xóa lịch hẹn khách đã đặt.
 */
export default function AppointmentManagement() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 8;

  // Đổi bộ lọc/tìm kiếm → quay về trang 1
  useEffect(() => { setPage(1); }, [filterStatus, search]);

  const loadAppointments = async () => {
    try {
      setAppointments(await appointmentApi.getAll());
    } catch {
      alert('Không tải được danh sách lịch hẹn. Kiểm tra backend đã chạy ở cổng 8080.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAppointments(); }, []);

  const filtered = appointments.filter(a => {
    if (filterStatus !== 'all' && a.status !== filterStatus) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!a.customerName.toLowerCase().includes(q) && !a.customerEmail.toLowerCase().includes(q) && !a.customerPhone.includes(search)) {
        return false;
      }
    }
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  // Xuất danh sách đang lọc ra file Excel .xlsx
  const handleExportExcel = () => {
    exportToExcel(filtered.map(a => ({
      'Mã lịch hẹn': a.id,
      'Khách hàng': a.customerName,
      'Email': a.customerEmail,
      'Số điện thoại': a.customerPhone,
      'Thời gian hẹn': formatDateTime(a.appointmentDate),
      'Lý do': a.reason,
      'Ghi chú': a.notes || '',
      'Nhân viên': a.staffName,
      'Trạng thái': statusConfig[a.status].label,
      'Ngày tạo': formatDateTime(a.createdAt),
    })), 'Lịch hẹn', `lich-hen-${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const updateStatus = async (id: number, status: Appointment['status']) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a)); // optimistic
    try {
      await appointmentApi.updateStatus(id, status);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Cập nhật trạng thái thất bại');
      await loadAppointments(); // hoàn tác optimistic update
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await appointmentApi.delete(id);
      setDeleteConfirm(null);
      await loadAppointments();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Xóa lịch hẹn thất bại');
    }
  };

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
          <h2 className="font-display text-2xl text-navy font-semibold">Quản Lý Lịch Hẹn</h2>
          <p className="text-muted text-sm mt-0.5">{appointments.length} lịch hẹn xem nhà</p>
        </div>
        <button
          onClick={handleExportExcel}
          disabled={filtered.length === 0}
          className="text-xs font-semibold text-teal border border-teal/30 px-4 py-2.5 rounded-xl hover:bg-teal/5 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          ⬇ Xuất Excel
        </button>
      </div>

      {/* Status summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'] as Appointment['status'][]).map(s => (
          <div key={s} className={`rounded-xl p-4 border ${statusConfig[s].color}`}>
            <p className="font-display text-2xl font-semibold">{appointments.filter(a => a.status === s).length}</p>
            <p className="text-xs mt-0.5">{statusConfig[s].label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-cream-dark flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Tìm theo tên, email, số điện thoại khách..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 min-w-48 px-4 py-2 text-sm rounded-xl border border-cream-dark text-navy bg-cream"
        />
        <div className="flex flex-wrap gap-2">
          {[
            { val: 'all', label: 'Tất Cả' },
            { val: 'PENDING', label: 'Chờ Xác Nhận' },
            { val: 'CONFIRMED', label: 'Đã Xác Nhận' },
            { val: 'COMPLETED', label: 'Hoàn Thành' },
            { val: 'CANCELLED', label: 'Đã Hủy' },
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
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase">Mã Hẹn</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase">Khách Hàng</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase">Thời Gian Hẹn</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase">Lý Do</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase">Nhân Viên</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase">Trạng Thái</th>
                <th className="px-5 py-3 text-xs font-semibold text-muted uppercase text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((a, i) => (
                <tr key={a.id} className={`border-b border-cream-dark hover:bg-cream/40 transition-colors ${i % 2 === 1 ? 'bg-cream/20' : ''}`}>
                  <td className="px-5 py-3">
                    <p className="font-mono-data text-navy text-xs font-bold">#{a.id}</p>
                    <p className="text-muted text-xs">Tạo: {formatDateTime(a.createdAt)}</p>
                  </td>
                  <td className="px-5 py-3">
                    <p className="text-navy text-sm font-medium">{a.customerName}</p>
                    <p className="text-muted text-xs">{a.customerEmail}</p>
                    <p className="text-muted text-xs">{a.customerPhone}</p>
                  </td>
                  <td className="px-5 py-3 text-xs text-navy font-mono-data">{formatDateTime(a.appointmentDate)}</td>
                  <td className="px-5 py-3">
                    <p className="text-navy text-sm line-clamp-1 max-w-48">{a.reason}</p>
                    {a.notes && <p className="text-muted text-xs line-clamp-1 max-w-48">{a.notes}</p>}
                  </td>
                  <td className="px-5 py-3 text-sm text-navy">{a.staffName}</td>
                  <td className="px-5 py-3" onClick={e => e.stopPropagation()}>
                    <select
                      value={a.status}
                      onChange={e => updateStatus(a.id, e.target.value as Appointment['status'])}
                      className={`text-xs font-semibold px-2 py-1 rounded-full border cursor-pointer bg-transparent ${statusConfig[a.status].color}`}
                    >
                      <option value="PENDING">Chờ Xác Nhận</option>
                      <option value="CONFIRMED">Xác Nhận</option>
                      <option value="COMPLETED">Hoàn Thành</option>
                      <option value="CANCELLED">Đã Hủy</option>
                    </select>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-center">
                      <button onClick={() => setDeleteConfirm(a.id)} className="text-xs text-error hover:text-error/80 border border-error/30 px-3 py-1.5 rounded-lg transition-all">
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-muted">
              <p className="text-2xl mb-2">📅</p>
              <p className="text-sm">Không tìm thấy lịch hẹn nào</p>
            </div>
          )}
          <Pagination page={safePage} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </div>

      {/* Delete confirm */}
      {deleteConfirm !== null && (
        <div className="fixed inset-0 bg-navy/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl text-center animate-fadeIn">
            <p className="text-4xl mb-3">⚠️</p>
            <h3 className="font-display text-xl text-navy font-semibold mb-2">Xóa Lịch Hẹn</h3>
            <p className="text-muted text-sm mb-5">Xóa lịch hẹn #{deleteConfirm}? Hành động này không thể hoàn tác.</p>
            <div className="flex gap-3">
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-2.5 rounded-xl bg-error text-cream font-semibold text-sm hover:bg-error/90 transition-colors">
                Xóa
              </button>
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 rounded-xl border border-cream-dark text-navy font-semibold text-sm transition-colors">
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
