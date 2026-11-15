import { useEffect, useState } from 'react';
import { View, User as MockUser, Booking as MockBooking, Property as MockProperty } from '../../data/mockData';
import { dashboardApi, userApi, propertyApi } from '../../utils/api';
import { transformUsers, transformBookings, transformProperties } from '../../utils/dataTransform';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, Legend
} from 'recharts';

interface AdminDashboardProps {
  navigate: (view: View) => void;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  confirmed: { label: 'Xác Nhận', color: 'bg-success/10 text-success' },
  pending: { label: 'Chờ', color: 'bg-warning/10 text-warning' },
  completed: { label: 'Hoàn Thành', color: 'bg-teal/10 text-teal' },
  cancelled: { label: 'Đã Hủy', color: 'bg-error/10 text-error' },
};

interface Stats {
  totalProperties: number;
  availableProperties: number;
  totalUsers: number;
  activeUsers: number;
  totalBookings: number;
  confirmedBookings: number;
  pendingBookings: number;
  totalRevenue: number;
}

interface RevenuePoint { month: string; revenue: number; bookings: number }
interface StatusSlice { name: string; value: number; color: string }

export default function AdminDashboard({ navigate }: AdminDashboardProps) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [revenueData, setRevenueData] = useState<RevenuePoint[]>([]);
  const [statusData, setStatusData] = useState<StatusSlice[]>([]);
  const [recentBookings, setRecentBookings] = useState<MockBooking[]>([]);
  const [recentUsers, setRecentUsers] = useState<MockUser[]>([]);
  const [properties, setProperties] = useState<MockProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [statsData, revenue, status, bookings, users, props] = await Promise.all([
          dashboardApi.getStats() as Promise<Stats>,
          dashboardApi.getRevenue(),
          dashboardApi.getBookingStatus(),
          dashboardApi.getRecentBookings(),
          userApi.getAll(),
          propertyApi.getAll(),
        ]);
        setStats(statsData);
        setRevenueData(revenue);
        const total = status.reduce((s, d) => s + d.value, 0) || 1;
        setStatusData(status.map(d => ({ ...d, value: Math.round((d.value / total) * 100) })));
        setRecentBookings(transformBookings(bookings));
        setRecentUsers(transformUsers(users).sort((a, b) => b.joinDate.localeCompare(a.joinDate)));
        setProperties(transformProperties(props));
      } catch (e) {
        setError('Không tải được dữ liệu dashboard. Kiểm tra backend đã chạy ở cổng 8080.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-gold/30 border-t-gold rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted text-sm">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="bg-error/10 border border-error/20 text-error text-sm px-4 py-3 rounded-xl animate-fadeIn">
        {error || 'Đã có lỗi xảy ra.'}
      </div>
    );
  }

  const statCards = [
    { label: 'Tổng Doanh Thu', val: `${stats.totalRevenue.toFixed(0)} tr`, sub: 'Từ các đơn đã thanh toán', icon: '💰', trend: 'up', bg: 'bg-gold/10 border-gold/20' },
    { label: 'Đặt Chỗ Đang Hoạt Động', val: stats.confirmedBookings, sub: `${stats.totalBookings} tổng cộng`, icon: '📋', trend: 'up', bg: 'bg-teal/10 border-teal/20' },
    { label: 'Người Dùng Hoạt Động', val: stats.activeUsers, sub: `${stats.totalUsers} tổng đăng ký`, icon: '👥', trend: 'stable', bg: 'bg-navy/5 border-navy/10' },
    { label: 'Nhà Còn Trống', val: stats.availableProperties, sub: `/${stats.totalProperties} tổng cộng`, icon: '🏡', trend: 'stable', bg: 'bg-success/10 border-success/20' },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map(card => (
          <div key={card.label} className={`bg-white rounded-2xl p-5 border ${card.bg} shadow-sm`}>
            <div className="flex items-start justify-between mb-3">
              <span className="text-2xl">{card.icon}</span>
              {card.trend === 'up' && (
                <span className="text-xs text-success bg-success/10 px-2 py-0.5 rounded-full">↑</span>
              )}
            </div>
            <p className="font-display text-3xl text-navy font-semibold">{card.val}</p>
            <p className="text-sm font-medium text-navy mt-1">{card.label}</p>
            <p className="text-xs text-muted mt-0.5">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Revenue chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-sm border border-cream-dark">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-display text-navy font-semibold">Doanh Thu 12 Tháng</h3>
              <p className="text-muted text-xs mt-0.5">Theo tháng (triệu VNĐ)</p>
            </div>
            <span className="text-xs text-teal bg-teal/10 px-3 py-1 rounded-full font-semibold">Dữ liệu thật</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={revenueData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C9A96E" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#C9A96E" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#EDE9E0" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6B7589' }} />
              <YAxis tick={{ fontSize: 11, fill: '#6B7589' }} />
              <Tooltip
                contentStyle={{ background: '#0D1F35', border: 'none', borderRadius: '8px', color: '#F8F6F1', fontSize: '12px' }}
                formatter={(val) => [`${val} tr`, 'Doanh thu']}
              />
              <Area type="monotone" dataKey="revenue" stroke="#C9A96E" strokeWidth={2} fill="url(#revenueGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Booking status pie */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-cream-dark">
          <h3 className="font-display text-navy font-semibold mb-1">Trạng Thái Đặt Chỗ</h3>
          <p className="text-muted text-xs mb-4">Phân phối tổng đặt chỗ</p>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={70}
                paddingAngle={3}
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#0D1F35', border: 'none', borderRadius: '8px', color: '#F8F6F1', fontSize: '12px' }} formatter={(val) => [`${val}%`, 'Tỷ lệ']} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {statusData.map(d => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                  <span className="text-muted">{d.name}</span>
                </div>
                <span className="font-semibold text-navy">{d.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bookings per month bar */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-cream-dark">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-display text-navy font-semibold">Số Đặt Chỗ Theo Tháng</h3>
            <p className="text-muted text-xs mt-0.5">12 tháng gần nhất</p>
          </div>
          <button onClick={() => navigate('admin-bookings')} className="text-xs text-teal hover:text-navy font-semibold">
            Xem tất cả →
          </button>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={revenueData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#EDE9E0" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6B7589' }} />
            <YAxis tick={{ fontSize: 11, fill: '#6B7589' }} allowDecimals={false} />
            <Tooltip
              contentStyle={{ background: '#0D1F35', border: 'none', borderRadius: '8px', color: '#F8F6F1', fontSize: '12px' }}
              formatter={(val) => [val, 'Số đặt chỗ']}
            />
            <Bar dataKey="bookings" fill="#1B5E7A" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Tables row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent bookings */}
        <div className="bg-white rounded-2xl shadow-sm border border-cream-dark overflow-hidden">
          <div className="px-5 py-4 border-b border-cream-dark flex items-center justify-between">
            <h3 className="font-display text-navy font-semibold">Đặt Chỗ Gần Đây</h3>
            <button onClick={() => navigate('admin-bookings')} className="text-xs text-teal hover:text-navy font-semibold">Xem tất cả →</button>
          </div>
          <div className="divide-y divide-cream-dark">
            {recentBookings.slice(0, 4).map(booking => (
              <div key={booking.id} className="px-5 py-3 flex items-center gap-3 hover:bg-cream/50 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-navy text-sm font-medium truncate">{booking.propertyName}</p>
                  <p className="text-muted text-xs">{booking.userName} · {booking.createdAt}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-mono-data text-navy text-xs font-semibold">{booking.totalPrice} tr</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${statusConfig[booking.status]?.color || 'bg-muted/10 text-muted'}`}>
                    {statusConfig[booking.status]?.label || booking.status}
                  </span>
                </div>
              </div>
            ))}
            {recentBookings.length === 0 && (
              <p className="px-5 py-6 text-muted text-sm text-center">Chưa có đặt chỗ nào</p>
            )}
          </div>
        </div>

        {/* Recent users */}
        <div className="bg-white rounded-2xl shadow-sm border border-cream-dark overflow-hidden">
          <div className="px-5 py-4 border-b border-cream-dark flex items-center justify-between">
            <h3 className="font-display text-navy font-semibold">Người Dùng Mới Nhất</h3>
            <button onClick={() => navigate('admin-users')} className="text-xs text-teal hover:text-navy font-semibold">Xem tất cả →</button>
          </div>
          <div className="divide-y divide-cream-dark">
            {recentUsers.slice(0, 4).map(user => (
              <div key={user.id} className="px-5 py-3 flex items-center gap-3 hover:bg-cream/50 transition-colors">
                <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover border border-cream-dark shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-navy text-sm font-medium">{user.name}</p>
                  <p className="text-muted text-xs truncate">{user.email}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                    user.status === 'active' ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
                  }`}>
                    {user.status === 'active' ? 'Hoạt Động' : 'Bị Khóa'}
                  </span>
                  <p className="text-xs text-muted mt-0.5">{user.joinDate}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Properties overview */}
      <div className="bg-white rounded-2xl shadow-sm border border-cream-dark">
        <div className="px-5 py-4 border-b border-cream-dark flex items-center justify-between">
          <h3 className="font-display text-navy font-semibold">Tổng Quan Tài Sản</h3>
          <button onClick={() => navigate('admin-properties')} className="text-xs text-teal hover:text-navy font-semibold">Quản Lý →</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-cream">
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase">Tài Sản</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase">Địa Điểm</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase">Giá/Tháng</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase">Đánh Giá</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase">Trạng Thái</th>
              </tr>
            </thead>
            <tbody>
              {properties.map((p, i) => (
                <tr key={p.id} className={`border-t border-cream-dark hover:bg-cream/50 transition-colors ${i % 2 === 1 ? 'bg-cream/20' : ''}`}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <img src={p.images[0]} alt={p.name} className="w-8 h-8 rounded-lg object-cover" />
                      <div>
                        <p className="text-navy text-sm font-medium">{p.name}</p>
                        <p className="text-muted text-xs capitalize">{p.type} · {(p.transactionType || 'rent') === 'buy' ? 'Bán' : 'Cho thuê'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-sm text-navy">{p.province}</td>
                  <td className="px-5 py-3 font-mono-data text-sm text-navy font-semibold">
                    {(p.transactionType || 'rent') === 'buy' && p.price >= 1000
                      ? `${(p.price / 1000).toLocaleString('vi-VN')} tỷ`
                      : `${p.price} tr`}
                  </td>
                  <td className="px-5 py-3 text-sm"><span className="text-gold">★</span> {p.rating}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      p.status === 'available' ? 'bg-success/10 text-success' :
                      p.status === 'booked' ? 'bg-warning/10 text-warning' :
                      'bg-muted/10 text-muted'
                    }`}>
                      {p.status === 'available' ? 'Còn Trống' : p.status === 'booked' ? 'Đã Đặt' : 'Bảo Trì'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
