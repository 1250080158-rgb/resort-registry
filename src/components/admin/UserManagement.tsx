import { useEffect, useState } from 'react';
import { User as MockUser, UserRole, UserStatus } from '../../data/mockData';
import { userApi, User as ApiUser } from '../../utils/api';
import { transformUsers } from '../../utils/dataTransform';
import { exportToExcel } from '../../utils/excelExport';
import Pagination from '../shared/Pagination';

const roleConfig: Record<string, { label: string; color: string }> = {
  user: { label: 'Người Dùng', color: 'bg-teal/10 text-teal border-teal/20' },
  staff: { label: 'Nhân Viên', color: 'bg-navy/5 text-navy border-navy/20' },
  admin: { label: 'Quản Trị Viên', color: 'bg-gold/10 text-gold-dark border-gold/20' },
};

const statusConfig = {
  active: { label: 'Hoạt Động', color: 'bg-success/10 text-success' },
  inactive: { label: 'Không Hoạt Động', color: 'bg-muted/10 text-muted' },
  banned: { label: 'Bị Khóa', color: 'bg-error/10 text-error' },
};

export default function UserManagement() {
  const [users, setUsers] = useState<MockUser[]>([]);
  const [rawUsers, setRawUsers] = useState<ApiUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedUser, setSelectedUser] = useState<MockUser | null>(null);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 8;

  // Đổi bộ lọc/tìm kiếm → quay về trang 1
  useEffect(() => { setPage(1); }, [filterRole, filterStatus, search]);

  const loadUsers = async () => {
    try {
      const data = await userApi.getAll();
      setRawUsers(data);
      setUsers(transformUsers(data));
    } catch {
      alert('Không tải được danh sách người dùng. Kiểm tra backend đã chạy ở cổng 8080.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadUsers(); }, []);

  const filtered = users.filter(u => {
    if (filterRole !== 'all' && u.role !== filterRole) return false;
    if (filterStatus !== 'all' && u.status !== filterStatus) return false;
    if (search && !u.name.toLowerCase().includes(search.toLowerCase()) && !u.email.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  // Xuất danh sách đang lọc ra file Excel .xlsx
  const handleExportExcel = () => {
    exportToExcel(filtered.map(u => ({
      'ID': u.id,
      'Họ tên': u.name,
      'Email': u.email,
      'Số điện thoại': u.phone,
      'CMND/CCCD': u.cmnd,
      'Địa chỉ': u.address,
      'Vai trò': (roleConfig[u.role] || roleConfig.user).label,
      'Trạng thái': statusConfig[u.status].label,
      'Ngày tham gia': u.joinDate,
      'Đăng nhập cuối': u.lastLogin || '',
      'Tổng đặt chỗ': u.totalBookings,
      'Tổng chi tiêu (triệu)': u.totalSpent,
    })), 'Người dùng', `nguoi-dung-${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const patchUser = async (id: string, patch: Partial<ApiUser>) => {
    const raw = rawUsers.find(r => r.id === Number(id));
    if (!raw) return;
    try {
      await userApi.update(raw.id, { ...raw, ...patch });
      await loadUsers();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Cập nhật người dùng thất bại');
    }
  };

  const changeRole = (id: string, role: UserRole) => {
    const apiRole = role.toUpperCase() as ApiUser['role'];
    setUsers(prev => prev.map(u => u.id === id ? { ...u, role } : u)); // optimistic
    patchUser(id, { role: apiRole });
  };

  const changeStatus = (id: string, status: UserStatus) => {
    const apiStatus = status.toUpperCase() as ApiUser['status'];
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status } : u));
    if (selectedUser?.id === id) setSelectedUser(prev => prev ? { ...prev, status } : null);
    patchUser(id, { status: apiStatus });
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
          <h2 className="font-display text-2xl text-navy font-semibold">Quản Lý Người Dùng</h2>
          <p className="text-muted text-sm mt-0.5">{users.length} người dùng đăng ký</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handleExportExcel}
            disabled={filtered.length === 0}
            className="text-xs font-semibold text-teal border border-teal/30 px-4 py-2.5 rounded-xl hover:bg-teal/5 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            ⬇ Xuất Excel
          </button>
          <div className="flex gap-3">
            {[
              { label: 'Tổng', val: users.length },
              { label: 'Hoạt Động', val: users.filter(u => u.status === 'active').length, color: 'text-success' },
              { label: 'Bị Khóa', val: users.filter(u => u.status === 'banned').length, color: 'text-error' },
            ].map(s => (
              <div key={s.label} className="text-center bg-white border border-cream-dark rounded-xl px-4 py-2">
                <p className={`font-display text-xl font-semibold ${s.color || 'text-navy'}`}>{s.val}</p>
                <p className="text-xs text-muted">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-cream-dark flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Tìm theo tên hoặc email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 min-w-48 px-4 py-2 text-sm rounded-xl border border-cream-dark text-navy bg-cream"
        />
        <div className="flex gap-2">
          {[{ val: 'all', label: 'Tất Cả Vai Trò' }, { val: 'user', label: 'User' }, { val: 'admin', label: 'Admin' }].map(f => (
            <button key={f.val} onClick={() => setFilterRole(f.val)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${filterRole === f.val ? 'bg-navy text-gold' : 'border border-cream-dark text-navy hover:border-navy/30'}`}>
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {[{ val: 'all', label: 'Tất Cả' }, { val: 'active', label: 'Hoạt Động' }, { val: 'banned', label: 'Bị Khóa' }].map(f => (
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
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase">Người Dùng</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase">Liên Hệ</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase">Vai Trò</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase">Đặt Chỗ</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase">Ngày Tham Gia</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase">Trạng Thái</th>
                <th className="px-5 py-3 text-xs font-semibold text-muted uppercase text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((user, i) => (
                <tr key={user.id} className={`border-b border-cream-dark hover:bg-cream/40 transition-colors ${i % 2 === 1 ? 'bg-cream/20' : ''}`}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => setSelectedUser(user)}>
                      <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-full object-cover border border-cream-dark shrink-0" />
                      <div>
                        <p className="text-navy text-sm font-semibold hover:text-teal transition-colors">{user.name}</p>
                        <p className="text-muted text-xs font-mono-data">{user.cmnd}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <p className="text-navy text-xs">{user.email}</p>
                    <p className="text-muted text-xs">{user.phone}</p>
                  </td>
                  <td className="px-5 py-3">
                    <select
                      value={user.role}
                      onChange={e => changeRole(user.id, e.target.value as UserRole)}
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full border cursor-pointer ${(roleConfig[user.role] || roleConfig.user).color} bg-transparent`}
                    >
                      <option value="user">Người Dùng</option>
                      <option value="admin">Quản Trị Viên</option>
                    </select>
                  </td>
                  <td className="px-5 py-3">
                    <p className="font-display text-navy font-semibold text-sm">{user.totalBookings}</p>
                    <p className="text-xs text-muted">{user.totalSpent} tr VNĐ</p>
                  </td>
                  <td className="px-5 py-3 text-xs text-muted font-mono-data">{user.joinDate}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusConfig[user.status].color}`}>
                      {statusConfig[user.status].label}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => setSelectedUser(user)} className="text-xs text-teal hover:text-navy border border-teal/30 hover:border-navy/30 px-3 py-1.5 rounded-lg transition-all">
                        Chi Tiết
                      </button>
                      {user.status === 'active' ? (
                        <button onClick={() => changeStatus(user.id, 'banned')} className="text-xs text-error border border-error/30 px-3 py-1.5 rounded-lg hover:bg-error/5 transition-all">
                          Khóa
                        </button>
                      ) : (
                        <button onClick={() => changeStatus(user.id, 'active')} className="text-xs text-success border border-success/30 px-3 py-1.5 rounded-lg hover:bg-success/5 transition-all">
                          Mở Khóa
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-muted">
              <p className="text-2xl mb-2">👥</p>
              <p className="text-sm">Không tìm thấy người dùng nào</p>
            </div>
          )}
          <Pagination page={safePage} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </div>

      {/* User detail modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-navy/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedUser(null)}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-fadeIn" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display text-xl text-navy font-semibold">Chi Tiết Người Dùng</h3>
              <button onClick={() => setSelectedUser(null)} className="text-muted hover:text-navy text-2xl leading-none">×</button>
            </div>

            <div className="flex items-center gap-4 mb-5">
              <img src={selectedUser.avatar} alt={selectedUser.name} className="w-16 h-16 rounded-2xl object-cover border-2 border-gold/30" />
              <div>
                <h4 className="font-display text-navy font-semibold text-lg">{selectedUser.name}</h4>
                <p className="text-muted text-sm">{selectedUser.email}</p>
                <div className="flex gap-2 mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${(roleConfig[selectedUser.role] || roleConfig.user).color} border`}>
                    {(roleConfig[selectedUser.role] || roleConfig.user).label}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${statusConfig[selectedUser.status].color}`}>
                    {statusConfig[selectedUser.status].label}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                { label: 'Điện Thoại', val: selectedUser.phone },
                { label: 'CMND/CCCD', val: selectedUser.cmnd, mono: true },
                { label: 'Ngày Tham Gia', val: selectedUser.joinDate },
                { label: 'Đăng Nhập Cuối', val: selectedUser.lastLogin },
                { label: 'Tổng Đặt Chỗ', val: `${selectedUser.totalBookings} lần` },
                { label: 'Tổng Chi Tiêu', val: `${selectedUser.totalSpent} tr` },
              ].map(row => (
                <div key={row.label} className="bg-cream rounded-xl p-3">
                  <p className="text-xs text-muted mb-0.5">{row.label}</p>
                  <p className={`text-navy font-semibold text-sm ${row.mono ? 'font-mono-data' : ''}`}>{row.val}</p>
                </div>
              ))}
            </div>

            <div className="mt-4">
              <p className="text-xs text-muted mb-1">Địa Chỉ</p>
              <p className="text-navy text-sm bg-cream rounded-xl p-3">{selectedUser.address}</p>
            </div>

            <div className="flex gap-3 mt-5">
              <button
                onClick={() => changeStatus(selectedUser.id, selectedUser.status === 'active' ? 'banned' : 'active')}
                className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-colors ${
                  selectedUser.status === 'active' ? 'bg-error text-cream hover:bg-error/90' : 'bg-success text-cream hover:bg-success/90'
                }`}
              >
                {selectedUser.status === 'active' ? 'Khóa Tài Khoản' : 'Mở Khóa Tài Khoản'}
              </button>
              <button onClick={() => setSelectedUser(null)} className="flex-1 py-2.5 rounded-xl border border-cream-dark text-navy font-semibold text-sm hover:border-navy/40 transition-colors">
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
