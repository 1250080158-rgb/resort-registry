import { useEffect, useState } from 'react';
import { Property as MockProperty, PropertyStatus, PropertyType, TransactionType } from '../../data/mockData';
import { propertyApi, Property as ApiProperty } from '../../utils/api';
import { transformProperties } from '../../utils/dataTransform';
import { exportToExcel } from '../../utils/excelExport';
import Pagination from '../shared/Pagination';

const statusConfig = {
  available: { label: 'Còn Trống', color: 'bg-success/10 text-success border-success/20' },
  booked: { label: 'Đã Đặt', color: 'bg-warning/10 text-warning border-warning/20' },
  maintenance: { label: 'Bảo Trì', color: 'bg-muted/10 text-muted border-muted/20' },
};

// Danh sách tiện nghi có thể gán cho tài sản
const AMENITY_OPTIONS = [
  'Hồ bơi riêng', 'Hồ bơi vô cực', 'Mặt biển', 'Sân vườn', 'BBQ ngoài trời',
  'Phòng gym', 'Spa & Wellness', 'Wifi tốc độ cao', 'An ninh 24/7', 'Bếp đầy đủ',
  'Điều hòa trung tâm', 'Smart TV', 'Bãi đỗ xe', 'Concierge 24/7', 'Valet parking',
];

export default function PropertyManagement() {
  const [properties, setProperties] = useState<MockProperty[]>([]);
  const [rawProperties, setRawProperties] = useState<ApiProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterTransaction, setFilterTransaction] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingProperty, setEditingProperty] = useState<MockProperty | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 8;

  // Đổi bộ lọc/tìm kiếm → quay về trang 1
  useEffect(() => { setPage(1); }, [filterStatus, filterTransaction, search]);
  const [form, setForm] = useState({
    name: '', resort: '', location: '', province: '', description: '',
    price: '', bedrooms: '', bathrooms: '', area: '',
    type: 'villa' as PropertyType, status: 'available' as PropertyStatus,
    transactionType: 'rent' as TransactionType,
  });

  const isBuyForm = form.transactionType === 'buy';
  // Giá bán hiển thị gọn hơn: >= 1000 triệu thì đổi ra tỷ
  const formatPrice = (price: number, transactionType?: string) => {
    if (transactionType === 'buy' && price >= 1000) {
      return `${(price / 1000).toLocaleString('vi-VN')} tỷ`;
    }
    return `${price} tr${transactionType === 'buy' ? ' (bán)' : '/tháng'}`;
  };

  const loadProperties = async () => {
    try {
      const data = await propertyApi.getAll();
      setRawProperties(data);
      setProperties(transformProperties(data));
    } catch {
      alert('Không tải được danh sách tài sản. Kiểm tra backend đã chạy ở cổng 8080.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadProperties(); }, []);

  const filtered = properties.filter(p => {
    if (filterStatus !== 'all' && p.status !== filterStatus) return false;
    if (filterTransaction !== 'all' && (p.transactionType || 'rent') !== filterTransaction) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.province.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  // Xuất danh sách đang lọc ra file Excel .xlsx
  const handleExportExcel = () => {
    exportToExcel(filtered.map(p => ({
      'ID': p.id,
      'Tên tài sản': p.name,
      'Khu nghỉ dưỡng': p.resort,
      'Tỉnh/Thành': p.province,
      'Địa điểm chi tiết': p.location,
      'Loại': p.type,
      'Hình thức': (p.transactionType || 'rent') === 'buy' ? 'Bán' : 'Cho thuê',
      'Giá (triệu)': p.price,
      'Phòng ngủ': p.bedrooms,
      'Phòng tắm': p.bathrooms,
      'Diện tích (m²)': p.area,
      'Đánh giá': p.rating,
      'Số đánh giá': p.reviews,
      'Trạng thái': statusConfig[p.status].label,
      'Nổi bật': p.featured ? 'Có' : 'Không',
      'Tiện nghi': p.amenities.join(', '),
    })), 'Tài sản', `tai-san-${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const openAdd = () => {
    setEditingProperty(null);
    setUploadFiles([]);
    setSelectedAmenities(['Wifi tốc độ cao', 'Điều hòa trung tâm']);
    setForm({ name: '', resort: '', location: '', province: '', description: '', price: '', bedrooms: '', bathrooms: '', area: '', type: 'villa', status: 'available', transactionType: 'rent' });
    setShowModal(true);
  };

  const openEdit = (p: MockProperty) => {
    setEditingProperty(p);
    setUploadFiles([]);
    setSelectedAmenities(p.amenities.filter(a => a.trim()));
    setForm({ name: p.name, resort: p.resort, location: p.location, province: p.province, description: p.description, price: String(p.price), bedrooms: String(p.bedrooms), bathrooms: String(p.bathrooms), area: String(p.area), type: p.type, status: p.status, transactionType: p.transactionType || 'rent' });
    setShowModal(true);
  };

  const toggleAmenity = (a: string) => {
    setSelectedAmenities(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]);
  };

  const handleSave = async () => {
    if (!form.name || !form.price) return;
    const numeric = {
      price: Number(form.price),
      bedrooms: Number(form.bedrooms) || 0,
      bathrooms: Number(form.bathrooms) || 0,
      area: Number(form.area) || 0,
    };
    const transactionType = form.transactionType.toUpperCase() as ApiProperty['transactionType'];
    try {
      let savedId: number | null = null;
      if (editingProperty) {
        const raw = rawProperties.find(r => r.id === Number(editingProperty.id));
        if (!raw) return;
        const updated = await propertyApi.update(raw.id, {
          ...raw,
          ...form,
          ...numeric,
          amenities: selectedAmenities.join(','),
          transactionType,
          type: form.type.toUpperCase() as ApiProperty['type'],
          status: form.status.toUpperCase() as ApiProperty['status'],
        });
        savedId = updated.id;
      } else {
        const created = await propertyApi.create({
          id: 0,
          name: form.name,
          resort: form.resort,
          location: form.location,
          province: form.province,
          description: form.description,
          ...numeric,
          transactionType,
          type: form.type.toUpperCase() as ApiProperty['type'],
          status: form.status.toUpperCase() as ApiProperty['status'],
          amenities: selectedAmenities.join(','),
          images: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&h=800&fit=crop&auto=format',
          rating: 0,
          reviews: 0,
          featured: false,
        });
        savedId = created.id;
      }
      // Tải các ảnh đã chọn lên server sau khi lưu thông tin
      for (const file of uploadFiles) {
        await propertyApi.uploadImage(savedId, file);
      }
      setShowModal(false);
      await loadProperties();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Lưu tài sản thất bại');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await propertyApi.delete(Number(id));
      setDeleteConfirm(null);
      await loadProperties();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Xóa tài sản thất bại');
    }
  };

  const toggleStatus = async (id: string) => {
    const target = properties.find(p => p.id === id);
    const raw = rawProperties.find(r => r.id === Number(id));
    if (!target || !raw) return;
    const next: PropertyStatus = target.status === 'available' ? 'maintenance' : 'available';
    try {
      await propertyApi.update(raw.id, { ...raw, status: next.toUpperCase() as ApiProperty['status'] });
      await loadProperties();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Đổi trạng thái thất bại');
    }
  };

  // Bật/tắt hiển thị "Nổi Bật" trên trang chủ và đầu danh sách
  const toggleFeatured = async (id: string) => {
    const raw = rawProperties.find(r => r.id === Number(id));
    if (!raw) return;
    try {
      await propertyApi.update(raw.id, { ...raw, featured: !raw.featured });
      await loadProperties();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Đổi trạng thái nổi bật thất bại');
    }
  };

  const Field = ({ label, val, onChange, type = 'text' }: { label: string; val: string; onChange: (v: string) => void; type?: string }) => (
    <div>
      <label className="text-xs font-semibold text-muted uppercase tracking-wide mb-1.5 block">{label}</label>
      <input type={type} value={val} onChange={e => onChange(e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg border border-cream-dark text-navy bg-cream" />
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-3 border-gold/30 border-t-gold rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl text-navy font-semibold">Quản Lý Nhà Ở</h2>
          <p className="text-muted text-sm mt-0.5">{properties.length} tài sản trong hệ thống</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportExcel}
            disabled={filtered.length === 0}
            className="text-xs font-semibold text-teal border border-teal/30 px-4 py-2.5 rounded-xl hover:bg-teal/5 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            ⬇ Xuất Excel
          </button>
          <button
            onClick={openAdd}
            className="bg-navy text-gold font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-navy-light transition-colors flex items-center gap-2"
          >
            <span>+</span> Thêm Tài Sản
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-cream-dark flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Tìm kiếm theo tên, địa điểm..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 text-sm rounded-xl border border-cream-dark text-navy bg-cream"
        />
        <div className="flex gap-2">
          {[{ val: 'all', label: 'Tất Cả' }, { val: 'available', label: 'Còn Trống' }, { val: 'booked', label: 'Đã Đặt' }, { val: 'maintenance', label: 'Bảo Trì' }].map(f => (
            <button
              key={f.val}
              onClick={() => setFilterStatus(f.val)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${filterStatus === f.val ? 'bg-navy text-gold' : 'border border-cream-dark text-navy hover:border-navy/30'}`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {[{ val: 'all', label: 'Thuê & Bán' }, { val: 'rent', label: 'Cho Thuê' }, { val: 'buy', label: 'Bán' }].map(f => (
            <button
              key={f.val}
              onClick={() => setFilterTransaction(f.val)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${filterTransaction === f.val ? 'bg-teal text-cream' : 'border border-cream-dark text-navy hover:border-navy/30'}`}
            >
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
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase">Tài Sản</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase">Địa Điểm</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase">Chi Tiết</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase">Giá/Tháng</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase">Đánh Giá</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase">Trạng Thái</th>
                <th className="px-5 py-3 text-xs font-semibold text-muted uppercase text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((p, i) => (
                <tr key={p.id} className={`border-b border-cream-dark hover:bg-cream/40 transition-colors ${i % 2 === 1 ? 'bg-cream/20' : ''}`}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <img src={p.images[0]} alt={p.name} className="w-12 h-9 rounded-lg object-cover shrink-0" />
                      <div>
                        <p className="text-navy text-sm font-semibold line-clamp-1">{p.name}</p>
                        <p className="text-muted text-xs capitalize">{p.type} · {p.resort}</p>
                        <span className={`inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          (p.transactionType || 'rent') === 'buy' ? 'bg-gold/15 text-gold-dark' : 'bg-teal/10 text-teal'
                        }`}>
                          {(p.transactionType || 'rent') === 'buy' ? '🏠 Bán' : '🔑 Cho thuê'}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-sm text-navy">{p.province}</td>
                  <td className="px-5 py-3 text-xs text-muted">
                    🛏 {p.bedrooms} · 🚿 {p.bathrooms} · 📐 {p.area}m²
                  </td>
                  <td className="px-5 py-3 font-mono-data text-navy font-semibold">{formatPrice(p.price, p.transactionType)}</td>
                  <td className="px-5 py-3 text-sm"><span className="text-gold">★</span> {p.rating} <span className="text-muted text-xs">({p.reviews})</span></td>
                  <td className="px-5 py-3">
                    <button
                      onClick={() => toggleStatus(p.id)}
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full border transition-all hover:opacity-70 ${statusConfig[p.status].color}`}
                    >
                      {statusConfig[p.status].label}
                    </button>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => toggleFeatured(p.id)}
                        title="Bật/tắt Nổi Bật trên trang chủ"
                        className={`text-xs border px-2.5 py-1.5 rounded-lg transition-all ${
                          p.featured
                            ? 'bg-gold/15 text-gold-dark border-gold/30 font-semibold'
                            : 'text-muted border-cream-dark hover:border-gold/40'
                        }`}
                      >
                        {p.featured ? '★ Nổi Bật' : '☆ Nổi Bật'}
                      </button>
                      <button onClick={() => openEdit(p)} className="text-xs text-teal hover:text-navy border border-teal/30 hover:border-navy/30 px-3 py-1.5 rounded-lg transition-all">
                        Sửa
                      </button>
                      <button onClick={() => setDeleteConfirm(p.id)} className="text-xs text-error hover:text-error/80 border border-error/30 px-3 py-1.5 rounded-lg transition-all">
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
              <p className="text-2xl mb-2">🏚</p>
              <p className="text-sm">Không tìm thấy tài sản nào</p>
            </div>
          )}
          <Pagination page={safePage} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-navy/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto animate-fadeIn" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display text-xl text-navy font-semibold">
                {editingProperty ? 'Chỉnh Sửa Tài Sản' : 'Thêm Tài Sản Mới'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-muted hover:text-navy text-2xl leading-none">×</button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2"><Field label="Tên Tài Sản" val={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} /></div>
              <div className="col-span-2">
                <label className="text-xs font-semibold text-muted uppercase tracking-wide mb-1.5 block">Hình Thức</label>
                <div className="flex gap-3">
                  {[{ val: 'rent' as TransactionType, label: '🔑 Cho Thuê', desc: 'Giá theo tháng, khách đặt chỗ online' },
                    { val: 'buy' as TransactionType, label: '🏠 Bán', desc: 'Giá bán nguyên căn, khách liên hệ qua chat' }].map(t => (
                    <button
                      key={t.val}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, transactionType: t.val }))}
                      className={`flex-1 p-3 rounded-xl border text-left transition-all ${form.transactionType === t.val ? 'border-navy bg-navy text-gold' : 'border-cream-dark text-navy hover:border-navy/30'}`}
                    >
                      <p className="text-sm font-semibold">{t.label}</p>
                      <p className={`text-xs mt-0.5 ${form.transactionType === t.val ? 'text-cream/60' : 'text-muted'}`}>{t.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted uppercase tracking-wide mb-1.5 block">Mô Hình Bất Động Sản</label>
                <select
                  value={form.resort}
                  onChange={e => setForm(f => ({ ...f, resort: e.target.value }))}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-cream-dark text-navy bg-cream cursor-pointer"
                >
                  <option value="">Chọn mô hình</option>
                  <option value="Nhà ở">Nhà ở</option>
                  <option value="Villa">Villa</option>
                  <option value="Chung cư">Chung cư</option>
                  <option value="Resort">Resort</option>
                  <option value="Penthouse">Penthouse</option>
                  <option value="Bungalow">Bungalow</option>
                  <option value="Căn hộ">Căn hộ</option>
                  <option value="Biệt thự">Biệt thự</option>
                  <option value="Duplex">Duplex</option>
                  <option value="Townhouse">Townhouse</option>
                  <option value="Shophouse">Shophouse</option>
                  <option value="Officetel">Officetel</option>
                </select>
              </div>
              <Field label="Tỉnh/Thành" val={form.province} onChange={v => setForm(f => ({ ...f, province: v }))} />
              <Field label="Địa Điểm Chi Tiết" val={form.location} onChange={v => setForm(f => ({ ...f, location: v }))} />
              <Field label={isBuyForm ? 'Giá Bán (triệu)' : 'Giá/Tháng (triệu)'} val={form.price} onChange={v => setForm(f => ({ ...f, price: v }))} type="number" />
              <Field label="Phòng Ngủ" val={form.bedrooms} onChange={v => setForm(f => ({ ...f, bedrooms: v }))} type="number" />
              <Field label="Phòng Tắm" val={form.bathrooms} onChange={v => setForm(f => ({ ...f, bathrooms: v }))} type="number" />
              <Field label="Diện Tích (m²)" val={form.area} onChange={v => setForm(f => ({ ...f, area: v }))} type="number" />
              <div>
                <label className="text-xs font-semibold text-muted uppercase tracking-wide mb-1.5 block">Loại</label>
                <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as PropertyType }))} className="w-full px-3 py-2 text-sm rounded-lg border border-cream-dark text-navy bg-cream cursor-pointer">
                  <option value="villa">Villa</option>
                  <option value="penthouse">Penthouse</option>
                  <option value="bungalow">Bungalow</option>
                  <option value="apartment">Căn Hộ</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted uppercase tracking-wide mb-1.5 block">Trạng Thái</label>
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as PropertyStatus }))} className="w-full px-3 py-2 text-sm rounded-lg border border-cream-dark text-navy bg-cream cursor-pointer">
                  <option value="available">Còn Trống</option>
                  <option value="booked">Đã Đặt</option>
                  <option value="maintenance">Bảo Trì</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="text-xs font-semibold text-muted uppercase tracking-wide mb-1.5 block">Mô Tả</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} className="w-full px-3 py-2 text-sm rounded-lg border border-cream-dark text-navy bg-cream resize-none" />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-semibold text-muted uppercase tracking-wide mb-2 block">
                  Tiện Nghi <span className="text-muted normal-case font-normal">({selectedAmenities.length} đã chọn)</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {AMENITY_OPTIONS.map(a => (
                    <label key={a} className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg border cursor-pointer transition-colors ${
                      selectedAmenities.includes(a) ? 'border-navy/30 bg-cream text-navy' : 'border-cream-dark text-muted hover:border-navy/20'
                    }`}>
                      <input
                        type="checkbox"
                        checked={selectedAmenities.includes(a)}
                        onChange={() => toggleAmenity(a)}
                        className="accent-gold"
                      />
                      {a}
                    </label>
                  ))}
                </div>
              </div>
              <div className="col-span-2">
                <label className="text-xs font-semibold text-muted uppercase tracking-wide mb-2 block">Hình Ảnh</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={e => setUploadFiles(Array.from(e.target.files || []))}
                  className="w-full text-sm text-muted file:mr-3 file:px-4 file:py-2 file:rounded-lg file:border-0 file:bg-cream file:text-navy file:font-semibold file:cursor-pointer hover:file:bg-cream-dark cursor-pointer"
                />
                {uploadFiles.length > 0 ? (
                  <p className="text-xs text-teal mt-2">Đã chọn {uploadFiles.length} ảnh — sẽ tải lên sau khi lưu</p>
                ) : (
                  <p className="text-xs text-muted mt-2">{editingProperty ? 'Giữ nguyên ảnh hiện tại nếu không chọn file mới' : 'Tài sản mới dùng ảnh mặc định nếu không chọn file'}</p>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button onClick={handleSave} className="flex-1 py-3 rounded-xl bg-navy text-gold font-semibold text-sm hover:bg-navy-light transition-colors">
                {editingProperty ? 'Lưu Thay Đổi' : 'Thêm Tài Sản'}
              </button>
              <button onClick={() => setShowModal(false)} className="flex-1 py-3 rounded-xl border border-cream-dark text-navy font-semibold text-sm hover:border-navy/40 transition-colors">
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-navy/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl text-center animate-fadeIn">
            <p className="text-4xl mb-3">⚠️</p>
            <h3 className="font-display text-xl text-navy font-semibold mb-2">Xác Nhận Xóa</h3>
            <p className="text-muted text-sm mb-5">Bạn có chắc muốn xóa tài sản này? Hành động này không thể hoàn tác.</p>
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
