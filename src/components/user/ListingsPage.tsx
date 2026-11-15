import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { View, Property, properties as mockProperties } from '../../data/mockData';
import { propertyApi } from '../../utils/api';
import { transformProperties } from '../../utils/dataTransform';
import Seo from '../../components/shared/Seo';

interface ListingsPageProps {
  navigate: (view: View, data?: unknown) => void;
  initialFilter?: { type?: string; deal?: 'rent' | 'buy' | 'all' };
}

const amenityOptions = ['Hồ bơi riêng', 'Mặt biển', 'Hồ bơi vô cực', 'Spa', 'Phòng gym', 'Wifi'];

// Format tiền tệ Việt Nam
const formatVND = (amount: number, isMonthly: boolean = false) => {
  if (amount >= 1000000) {
    const millions = amount / 1000000;
    return {
      main: millions.toLocaleString('vi-VN', { minimumFractionDigits: 0, maximumFractionDigits: 1 }),
      unit: 'triệu VNĐ',
      hint: isMonthly ? 'triệu/tháng' : 'triệu VNĐ',
    };
  }
  return {
    main: amount.toLocaleString('vi-VN'),
    unit: 'VNĐ',
    hint: 'VNĐ',
  };
};

// Nhãn giá theo hình thức: nhà bán >= 1000 triệu hiển thị theo tỷ
const priceLabel = (p: Property) => {
  if (p.transactionType === 'buy') {
    const vndAmount = p.price * 1000000; // Convert to actual VND
    return {
      main: vndAmount >= 1000000000 ? `${(vndAmount / 1000000000).toLocaleString('vi-VN', { minimumFractionDigits: 0, maximumFractionDigits: 1 })}` : `${(vndAmount / 1000000).toLocaleString('vi-VN', { minimumFractionDigits: 0, maximumFractionDigits: 1 })}`,
      unit: vndAmount >= 1000000000 ? 'tỷ VNĐ' : 'triệu VNĐ',
      hint: 'Giá bán',
    };
  }
  return { main: `${p.price}`, unit: 'triệu VNĐ/tháng', hint: 'Cho thuê' };
};

export default function ListingsPage({ navigate, initialFilter }: ListingsPageProps) {
  const routerNavigate = useNavigate();
  const location = useLocation();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMockData, setShowMockData] = useState(false);
  const [search, setSearch] = useState('');
  const [province, setProvince] = useState('');
  const [type, setType] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [transactionFilter, setTransactionFilter] = useState<'all' | 'rent' | 'buy'>('all');
  const [sort, setSort] = useState('featured');
  const [view, setView] = useState<'grid' | 'list'>('grid');

  // Áp dụng initialFilter từ route (ví dụ /thue-biet-thu-nghi-duong → villa)
  useEffect(() => {
    if (!initialFilter) return;
    if (initialFilter.type) setType(initialFilter.type);
    if (initialFilter.deal) setTransactionFilter(initialFilter.deal);
  }, [initialFilter]);

  // Xử lý filter từ navigation (danh sách nhà vs khu nghỉ dưỡng)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const filterParam = urlParams.get('filter');
    if (filterParam === 'buy') {
      setTransactionFilter('buy');
    } else if (filterParam === 'rent') {
      setTransactionFilter('rent');
    }
  }, []);

  useEffect(() => {
    propertyApi.getAll()
      .then(data => {
        const transformed = transformProperties(data);
        setProperties(transformed.length > 0 ? transformed : mockProperties);
        setShowMockData(transformed.length === 0);
      })
      .catch(() => {
        setProperties(mockProperties);
        setShowMockData(true);
      })
      .finally(() => setLoading(false));
  }, []);

  const listingSeo = (() => {
    const path = location.pathname;
    if (path === '/thue-biet-thu-nghi-duong') {
      return {
        title: 'Thuê biệt thự nghỉ dưỡng cao cấp tại Việt Nam',
        description: 'Danh sách biệt thự nghỉ dưỡng cao cấp cho thuê tại Việt Nam: Đà Nẵng, Phú Quốc, Nha Trang, Hội An. Giá tốt, dịch vụ 5 sao.',
        image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&h=630&fit=crop&auto=format',
      };
    }
    if (path === '/thue-bungalow-bien') {
      return {
        title: 'Thuê bungalow biển nghỉ dưỡng tại Việt Nam',
        description: 'Danh sách bungalow biển nghỉ dưỡng tại Việt Nam: Đà Nẵng, Phú Quốc, Nha Trang. Kiến trúc eco-friendly, đơn giản để thuê.',
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=630&fit=crop&auto=format',
      };
    }
    if (path === '/mua-ban-bat-dong-san-nghi-duong') {
      return {
        title: 'Mua bất động sản nghỉ dưỡng tại Việt Nam',
        description: 'Mua bán bất động sản nghỉ dưỡng cao cấp tại Việt Nam: biệt thự, penthouse, villa. Pháp lý minh bạch, giao dịch bảo mật.',
        image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1200&h=630&fit=crop&auto=format',
      };
    }
    return {
      title: 'Danh sách nhà nghỉ dưỡng Việt Nam - Thuê và mua biệt thự',
      description: 'Duyệt và đăng ký căn nhà nghỉ dưỡng cao cấp tại Đà Nẵng, Phú Quốc, Nha Trang, Hội An. Nhà có sẵn cho thuê và mua bán.',
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&h=630&fit=crop&auto=format',
    };
  })();

  const filtered = useMemo(() => {
    let result = [...properties];
    if (search) result = result.filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.resort.toLowerCase().includes(search.toLowerCase()) ||
      p.province.toLowerCase().includes(search.toLowerCase())
    );
    if (province) result = result.filter(p => p.province === province);
    if (type) result = result.filter(p => p.type === type);
    if (minPrice) result = result.filter(p => p.price >= Number(minPrice));
    if (maxPrice) result = result.filter(p => p.price <= Number(maxPrice));
    if (bedrooms) result = result.filter(p => p.bedrooms >= Number(bedrooms));
    if (transactionFilter !== 'all') result = result.filter(p => (p.transactionType || 'rent') === transactionFilter);
    if (selectedAmenities.length) result = result.filter(p =>
      selectedAmenities.every(a => p.amenities.includes(a))
    );
    if (sort === 'price-asc') result.sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') result.sort((a, b) => b.price - a.price);
    if (sort === 'rating') result.sort((a, b) => b.rating - a.rating);
    if (sort === 'featured') result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    return result;
  }, [properties, search, province, type, minPrice, maxPrice, bedrooms, selectedAmenities, transactionFilter, sort]);

  const toggleAmenity = (a: string) => {
    setSelectedAmenities(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]);
  };

  const statusColor = (status: Property['status']) => {
    if (status === 'available') return 'bg-success text-cream';
    if (status === 'booked') return 'bg-warning text-cream';
    return 'bg-muted text-cream';
  };
  const statusLabel = (status: Property['status']) => {
    if (status === 'available') return 'Còn Trống';
    if (status === 'booked') return 'Đã Đặt';
    return 'Bảo Trì';
  };

  return (
    <>
      <Seo
        title={listingSeo.title}
        description={listingSeo.description}
        path={location.pathname}
        image={listingSeo.image}
        type="website"
      />
      <div className="min-h-screen bg-cream">
      {/* Page header */}
      <div className="bg-navy py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <p className="text-gold text-xs tracking-widest uppercase mb-2">Khám Phá</p>
          <h1 className="font-display text-3xl text-cream font-semibold mb-2">Danh Sách Nhà Ở</h1>
          <p className="text-cream/60 text-sm">{filtered.length} căn nhà phù hợp với tiêu chí của bạn</p>
          {showMockData && <p className="text-teal text-xs font-semibold mt-1">Đang hiển thị dữ liệu mẫu</p>}

          <div className="mt-6 flex gap-3 flex-wrap">
            <div className="flex gap-1 bg-navy-lighter rounded-lg p-1">
              {[
                { val: 'all' as const, label: 'Tất Cả' },
                { val: 'rent' as const, label: 'Cho Thuê' },
                { val: 'buy' as const, label: 'Mua Bán' },
              ].map(t => (
                <button
                  key={t.val}
                  onClick={() => setTransactionFilter(t.val)}
                  className={`px-4 py-2 rounded text-sm font-semibold transition-colors ${transactionFilter === t.val ? 'bg-gold text-navy' : 'text-cream/60 hover:text-cream'}`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 max-w-sm bg-navy-lighter text-cream placeholder-cream/40 text-sm px-4 py-2.5 rounded-lg border border-navy-lighter focus:border-gold/50"
            />
            <div className="flex gap-1 bg-navy-lighter rounded-lg p-1">
              <button
                onClick={() => setSort('price-asc')}
                className={`px-3 py-2 rounded text-sm font-semibold transition-colors ${sort === 'price-asc' ? 'bg-gold text-navy' : 'text-cream/60 hover:text-cream'}`}
              >
                💰 Giá Thấp → Cao
              </button>
              <button
                onClick={() => setSort('price-desc')}
                className={`px-3 py-2 rounded text-sm font-semibold transition-colors ${sort === 'price-desc' ? 'bg-gold text-navy' : 'text-cream/60 hover:text-cream'}`}
              >
                💰 Giá Cao → Thấp
              </button>
            </div>
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              className="bg-navy-lighter text-cream text-sm px-4 py-2.5 rounded-lg border border-navy-lighter cursor-pointer"
            >
              <option value="featured">Nổi Bật</option>
              <option value="rating">Đánh Giá Cao Nhất</option>
            </select>
            <div className="flex gap-1 bg-navy-lighter rounded-lg p-1">
              <button
                onClick={() => setView('grid')}
                className={`px-3 py-1.5 rounded text-sm transition-colors ${view === 'grid' ? 'bg-gold text-navy' : 'text-cream/60 hover:text-cream'}`}
              >
                ⊞
              </button>
              <button
                onClick={() => setView('list')}
                className={`px-3 py-1.5 rounded text-sm transition-colors ${view === 'list' ? 'bg-gold text-navy' : 'text-cream/60 hover:text-cream'}`}
              >
                ≡
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 flex gap-8">
        {/* Sidebar Filters */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="bg-white rounded-2xl p-5 shadow-sm sticky top-20">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-navy">Bộ Lọc</h3>
              <button
                onClick={() => { setProvince(''); setType(''); setMinPrice(''); setMaxPrice(''); setBedrooms(''); setSelectedAmenities([]); setTransactionFilter('all'); }}
                className="text-xs text-teal hover:text-navy"
              >
                Xóa tất cả
              </button>
            </div>

            {/* Province */}
            <div className="mb-5">
              <label className="text-xs font-semibold text-muted uppercase tracking-wide mb-2 block">Địa Điểm</label>
              <select
                value={province}
                onChange={e => setProvince(e.target.value)}
                className="w-full text-sm px-3 py-2 rounded-lg border border-cream-dark text-navy bg-cream cursor-pointer"
              >
                <option value="">Tất cả</option>
                {['Đà Nẵng', 'Phú Quốc', 'Nha Trang', 'Hội An', 'Bình Thuận', 'Bà Rịa - Vũng Tàu'].map(p => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </div>

            {/* Type */}
            <div className="mb-5">
              <label className="text-xs font-semibold text-muted uppercase tracking-wide mb-2 block">Loại Nhà</label>
              <div className="space-y-2">
                {[{ val: '', label: 'Tất cả' }, { val: 'villa', label: 'Villa' }, { val: 'penthouse', label: 'Penthouse' }, { val: 'bungalow', label: 'Bungalow' }].map(opt => (
                  <label key={opt.val} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="type"
                      checked={type === opt.val}
                      onChange={() => setType(opt.val)}
                      className="accent-gold"
                    />
                    <span className="text-sm text-navy">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price */}
            <div className="mb-5">
              <label className="text-xs font-semibold text-muted uppercase tracking-wide mb-2 block">Giá (triệu/tháng)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Từ"
                  value={minPrice}
                  onChange={e => setMinPrice(e.target.value)}
                  className="w-1/2 text-sm px-3 py-2 rounded-lg border border-cream-dark text-navy bg-cream"
                />
                <input
                  type="number"
                  placeholder="Đến"
                  value={maxPrice}
                  onChange={e => setMaxPrice(e.target.value)}
                  className="w-1/2 text-sm px-3 py-2 rounded-lg border border-cream-dark text-navy bg-cream"
                />
              </div>
            </div>

            {/* Bedrooms */}
            <div className="mb-5">
              <label className="text-xs font-semibold text-muted uppercase tracking-wide mb-2 block">Phòng Ngủ Tối Thiểu</label>
              <div className="flex gap-2">
                {['', '1', '2', '3', '4'].map(b => (
                  <button
                    key={b}
                    onClick={() => setBedrooms(b)}
                    className={`flex-1 py-1.5 text-sm rounded-lg border transition-colors ${bedrooms === b ? 'bg-navy text-gold border-navy' : 'border-cream-dark text-navy hover:border-navy/30'}`}
                  >
                    {b || 'Tất'}
                  </button>
                ))}
              </div>
            </div>

            {/* Amenities */}
            <div>
              <label className="text-xs font-semibold text-muted uppercase tracking-wide mb-2 block">Tiện Nghi</label>
              <div className="space-y-2">
                {amenityOptions.map(a => (
                  <label key={a} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedAmenities.includes(a)}
                      onChange={() => toggleAmenity(a)}
                      className="accent-gold"
                    />
                    <span className="text-sm text-navy">{a}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Grid / List */}
        <main className="flex-1">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-10 h-10 border-3 border-gold/30 border-t-gold rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-4xl mb-4">🏖</p>
              <p className="font-display text-xl text-navy mb-2">Không tìm thấy kết quả</p>
              <p className="text-muted text-sm">Hãy thử thay đổi bộ lọc tìm kiếm</p>
            </div>
          ) : view === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {filtered.map(property => (
                <PropertyCard key={property.id} property={property} navigate={navigate} statusColor={statusColor} statusLabel={statusLabel} />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map(property => (
                <PropertyListItem key={property.id} property={property} navigate={navigate} statusColor={statusColor} statusLabel={statusLabel} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
    </>
  );
}

function PropertyCard({ property, navigate, statusColor, statusLabel }: {
  property: Property;
  navigate: (view: View, data?: unknown) => void;
  statusColor: (s: Property['status']) => string;
  statusLabel: (s: Property['status']) => string;
}) {
  return (
    <div
      className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group cursor-pointer"
      onClick={() => navigate('property-detail', property)}
    >
      <div className="relative h-52 overflow-hidden bg-navy/5">
        <img
          src={property.images[0]}
          alt={property.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute top-3 left-3">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColor(property.status)}`}>
            {statusLabel(property.status)}
          </span>
        </div>
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur rounded-full px-2.5 py-1 flex items-center gap-1">
          <span className="text-gold text-xs">★</span>
          <span className="text-navy text-xs font-semibold">{property.rating}</span>
          <span className="text-muted text-xs">({property.reviews})</span>
        </div>
        <div className="absolute bottom-3 left-3 bg-navy/70 backdrop-blur text-gold text-xs font-semibold px-2 py-0.5 rounded capitalize">
          {property.type}
        </div>
        <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur text-navy text-xs font-semibold px-2 py-0.5 rounded-full">
          {(property.transactionType || 'rent') === 'buy' ? '🏠 Bán' : '🔑 Cho thuê'}
        </div>
      </div>

      <div className="p-4">
        <p className="text-muted text-xs mb-0.5">{property.resort} · {property.province}</p>
        <h3 className="font-display text-navy font-semibold mb-1 group-hover:text-teal transition-colors line-clamp-1">
          {property.name}
        </h3>

        <div className="flex items-center gap-3 text-xs text-muted my-3">
          <span>🛏 {property.bedrooms} PN</span>
          <span>🚿 {property.bathrooms} WC</span>
          <span>📐 {property.area} m²</span>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-cream-dark">
          <div>
            <span className="font-display text-xl text-navy font-semibold">{priceLabel(property).main}</span>
            <span className="text-muted text-xs ml-1">{priceLabel(property).unit}</span>
          </div>
          <button
            onClick={e => { e.stopPropagation(); navigate('property-detail', property); }}
            className={`text-xs font-semibold px-4 py-2 rounded-lg transition-all ${
              property.status === 'available' && property.transactionType !== 'buy'
                ? 'bg-navy text-gold hover:bg-navy-light'
                : 'bg-teal text-cream hover:bg-teal/90'
            }`}
          >
            {property.transactionType === 'buy' ? 'Xem Chi Tiết' : property.status === 'available' ? 'Đặt Chỗ' : 'Không KD'}
          </button>
        </div>
      </div>
    </div>
  );
}


function PropertyListItem({ property, navigate, statusColor, statusLabel }: {
  property: Property;
  navigate: (view: View, data?: unknown) => void;
  statusColor: (s: Property['status']) => string;
  statusLabel: (s: Property['status']) => string;
}) {
  return (
    <div
      className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all flex cursor-pointer group"
      onClick={() => navigate('property-detail', property)}
    >
      <div className="relative w-48 shrink-0 overflow-hidden bg-navy/5">
        <img
          src={property.images[0]}
          alt={property.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute top-2 left-2">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusColor(property.status)}`}>
            {statusLabel(property.status)}
          </span>
        </div>
      </div>
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <p className="text-muted text-xs mb-0.5">{property.resort} · {property.province}</p>
          <h3 className="font-display text-navy font-semibold text-lg group-hover:text-teal transition-colors">
            {property.name}
          </h3>
          <p className="text-muted text-sm mt-1 line-clamp-2">{property.description}</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {property.amenities.slice(0, 4).map(a => (
              <span key={a} className="text-xs bg-cream text-muted px-2 py-0.5 rounded-full">{a}</span>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-4 text-xs text-muted">
            <span>🛏 {property.bedrooms} PN</span>
            <span>🚿 {property.bathrooms} WC</span>
            <span>📐 {property.area} m²</span>
            <span className="text-gold">★ {property.rating} ({property.reviews})</span>
          </div>
          <div className="flex items-center gap-4">
            <div>
              <span className="font-display text-2xl text-navy font-semibold">{priceLabel(property).main}</span>
              <span className="text-muted text-xs ml-1">{priceLabel(property).unit}</span>
            </div>
            <button
              onClick={e => { e.stopPropagation(); navigate('property-detail', property); }}
              className="bg-navy text-gold text-sm font-semibold px-5 py-2 rounded-xl hover:bg-navy-light transition-colors"
            >
              Xem Chi Tiết
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
