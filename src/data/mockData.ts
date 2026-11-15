export type PropertyType = 'villa' | 'penthouse' | 'bungalow' | 'apartment';
export type PropertyStatus = 'available' | 'booked' | 'maintenance';
export type TransactionType = 'rent' | 'buy';
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';
export type PaymentStatus = 'unpaid' | 'paid' | 'refunded';
export type UserRole = 'user' | 'admin';
export type UserStatus = 'active' | 'inactive' | 'banned';
export type View =
  | 'home' | 'listings' | 'property-detail' | 'booking-form'
  | 'booking-confirm' | 'payment' | 'payment-success' | 'profile' | 'history'
  | 'admin-dashboard' | 'admin-properties' | 'admin-users'
  | 'admin-bookings' | 'admin-appointments' | 'admin-fees' | 'admin-settings' | 'admin-chat' | 'login'
  | 'forgot-password';

export interface Property {
  id: string;
  name: string;
  resort: string;
  location: string;
  province: string;
  description: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  area: number;
  type: PropertyType;
  status: PropertyStatus;
  transactionType?: TransactionType;
  amenities: string[];
  images: string[];
  rating: number;
  reviews: number;
  floorLevel?: number;
  featured?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  cmnd: string;
  address: string;
  role: UserRole;
  status: UserStatus;
  joinDate: string;
  lastLogin: string;
  avatar: string;
  totalBookings: number;
  totalSpent: number;
}

export interface Booking {
  id: string;
  userId: string;
  propertyId: string;
  propertyName: string;
  resort: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  startDate: string;
  endDate: string;
  months: number;
  basePrice: number;
  processingFee: number;
  deposit: number;
  totalPrice: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  createdAt: string;
  notes?: string;
}

export interface Fee {
  id: string;
  name: string;
  type: 'percentage' | 'fixed';
  amount: number;
  enabled: boolean;
  description: string;
  appliesTo: string;
}

export const properties: Property[] = [
  {
    id: 'p001',
    name: 'Biệt Thự Bãi Biển Azure',
    resort: 'Azure Bay Resort',
    location: 'Bãi biển Mỹ Khê',
    province: 'Đà Nẵng',
    description: 'Biệt thự sang trọng với tầm nhìn toàn cảnh bãi biển Mỹ Khê, thiết kế hiện đại kết hợp phong cách Đông Nam Á. Hồ bơi riêng, sân vườn rộng rãi và đội ngũ phục vụ 24/7 đảm bảo trải nghiệm sống đẳng cấp nhất.',
    price: 85,
    bedrooms: 4,
    bathrooms: 3,
    area: 320,
    type: 'villa',
    status: 'available',
    amenities: ['Hồ bơi riêng', 'Bãi đỗ xe', 'Sân vườn', 'BBQ ngoài trời', 'Phòng gym', 'Wifi tốc độ cao', 'An ninh 24/7', 'Bếp đầy đủ', 'Điều hòa trung tâm', 'Smart TV'],
    images: [
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&h=800&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1615880484746-a134be9a6ecf?w=1200&h=800&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200&h=800&fit=crop&auto=format'
    ],
    rating: 4.9,
    reviews: 47,
    featured: true
  },
  {
    id: 'p002',
    name: 'Pearl Island Penthouse',
    resort: 'Pearl Island Grand',
    location: 'Bãi Trường',
    province: 'Phú Quốc',
    description: 'Penthouse đỉnh cao 42 tầng với tầm nhìn 360° ra biển Phú Quốc và vịnh Thái Lan. Thiết kế tối giản sang trọng với vật liệu marble Italy và đồ nội thất thương hiệu quốc tế.',
    price: 120,
    bedrooms: 3,
    bathrooms: 3,
    area: 280,
    type: 'penthouse',
    status: 'available',
    amenities: ['Rooftop pool', 'Sky lounge', 'Spa & Wellness', 'Concierge 24/7', 'Valet parking', 'Phòng hội nghị', 'Nhà hàng riêng', 'Helipad access', 'Wine cellar', 'Smart home'],
    images: [
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&h=800&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&h=800&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1200&h=800&fit=crop&auto=format'
    ],
    rating: 4.8,
    reviews: 31,
    floorLevel: 42,
    featured: true
  },
  {
    id: 'p003',
    name: 'Villa Hội An Cổ Phố',
    resort: 'Heritage Hoi An Retreat',
    location: 'Cẩm An',
    province: 'Hội An',
    description: 'Villa phong cách Hội An cổ kính kết hợp tiện nghi hiện đại. Kiến trúc mái ngói truyền thống, sân vườn tre xanh mát và hồ bơi tích hợp phản chiếu vẻ đẹp văn hóa miền Trung.',
    price: 65,
    bedrooms: 3,
    bathrooms: 2,
    area: 240,
    type: 'villa',
    status: 'available',
    amenities: ['Hồ bơi riêng', 'Vườn Nhật', 'Xe đạp miễn phí', 'Lớp học nấu ăn', 'Yoga deck', 'Wifi cao tốc', 'Bếp full', 'Phòng trà', 'Dịch vụ giặt ủi', 'Tour văn hóa'],
    images: [
      'https://images.unsplash.com/photo-1540541338537-b11f8a4f1e7a?w=1200&h=800&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&h=800&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&h=800&fit=crop&auto=format'
    ],
    rating: 4.7,
    reviews: 63,
    featured: true
  },
  {
    id: 'p004',
    name: 'Coral Bay Bungalow',
    resort: 'Coral Bay Resort',
    location: 'Bãi Biển Bãi Dài',
    province: 'Nha Trang',
    description: 'Bungalow trên mặt biển với lối đi riêng xuống bãi cát trắng mịn. Kiến trúc eco-friendly bằng vật liệu tự nhiên, hòa hợp hoàn toàn với thiên nhiên nhiệt đới.',
    price: 55,
    bedrooms: 2,
    bathrooms: 2,
    area: 180,
    type: 'bungalow',
    status: 'booked',
    amenities: ['Lối riêng ra biển', 'Kayak & SUP', 'Snorkeling gear', 'Nền tảng trên nước', 'Hammock garden', 'Mini bar', 'Điều hòa', 'Outdoor shower', 'Fire pit', 'Morning yoga'],
    images: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=800&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1439130490301-25e322d88054?w=1200&h=800&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&h=800&fit=crop&auto=format'
    ],
    rating: 4.6,
    reviews: 89,
  },
  {
    id: 'p005',
    name: 'Cliffside Villa Mũi Né',
    resort: 'Mui Ne Summit Resort',
    location: 'Mũi Né',
    province: 'Bình Thuận',
    description: 'Villa cheo leo trên vách đá với tầm nhìn panoramic ra Biển Đông. Hồ bơi vô cực tích hợp cảnh quan biển, kiến trúc minimalist mạnh mẽ tôn lên vẻ hoang sơ của thiên nhiên.',
    price: 75,
    bedrooms: 3,
    bathrooms: 2,
    area: 260,
    type: 'villa',
    status: 'available',
    amenities: ['Hồ bơi vô cực', 'Cliff view terrace', 'Sunset bar', 'Private chef', 'Spa tại nhà', 'Windsurfing access', 'ATV tours', 'Wine collection', 'Fire lounge', 'Stargazing deck'],
    images: [
      'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=1200&h=800&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1602343168117-bb8ffe3e2e9f?w=1200&h=800&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1200&h=800&fit=crop&auto=format'
    ],
    rating: 4.9,
    reviews: 28,
  },
  {
    id: 'p006',
    name: 'Island Eco Villa Côn Đảo',
    resort: 'Con Dao National Reserve',
    location: 'Côn Sơn',
    province: 'Bà Rịa - Vũng Tàu',
    description: 'Villa sinh thái độc đáo trong vùng bảo tồn quốc gia Côn Đảo. Hòa mình vào thiên nhiên nguyên sơ với dịch vụ luxury-eco, lặn biển coral reef và trải nghiệm rùa biển đẻ trứng.',
    price: 95,
    bedrooms: 2,
    bathrooms: 2,
    area: 200,
    type: 'villa',
    status: 'maintenance',
    amenities: ['Reef diving', 'Turtle watching tour', 'Kayaking', 'Nature trails', 'Solar powered', 'Organic meals', 'Marine research', 'Snorkeling', 'Sea kayak', 'Night safari'],
    images: [
      'https://images.unsplash.com/photo-1483347756197-71ef80e95f73?w=1200&h=800&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=1200&h=800&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=1200&h=800&fit=crop&auto=format'
    ],
    rating: 4.8,
    reviews: 19,
  },
  {
    id: 'p007',
    name: 'Biệt Thự Đại Dương Đà Nẵng',
    resort: 'Ocean Pearl Danang',
    location: 'Bãi biển Mỹ Khê',
    province: 'Đà Nẵng',
    description: 'Biệt thự ven biển cao cấp tại Đà Nẵng, thiết kế hiện đại với tầm nhìn toàn cảnh biển Đông. Có hồ bơi riêng, sân vườn rộng và bãi đỗ xe riêng. Phù hợp gia đình muốn sở hữu nhà nghỉ dưỡng ven biển.',
    price: 1850,
    bedrooms: 5,
    bathrooms: 4,
    area: 420,
    type: 'villa',
    status: 'available',
    transactionType: 'buy',
    amenities: ['Hồ bơi riêng', 'Bãi đỗ xe', 'Sân vườn', 'BBQ ngoài trời', 'Phòng gym', 'Wifi tốc độ cao', 'An ninh 24/7', 'Bếp đầy đủ', 'Điều hòa trung tâm', 'Smart TV'],
    images: [
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&h=800&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1615880484746-a134be9a6ecf?w=1200&h=800&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200&h=800&fit=crop&auto=format'
    ],
    rating: 4.9,
    reviews: 40,
    featured: true
  },
  {
    id: 'p008',
    name: 'Penthouse Marina Phú Quốc',
    resort: 'Marina Grand Phu Quoc',
    location: 'Bãi Sao',
    province: 'Phú Quốc',
    description: 'Penthouse đỉnh cao tại khu resort Marina Phú Quốc, tầm nhìn 360 độ ra biển và vịnh Thái Lan. Thiết kế tối giản sang trọng với nội thất thương hiệu quốc tế và hệ thống smart home.',
    price: 2200,
    bedrooms: 4,
    bathrooms: 4,
    area: 380,
    type: 'penthouse',
    status: 'available',
    transactionType: 'buy',
    amenities: ['Rooftop pool', 'Sky lounge', 'Spa & Wellness', 'Concierge 24/7', 'Valet parking', 'Nhà hàng riêng', 'Wine cellar', 'Smart home', 'Hồ bơi vô cực', 'Private chef'],
    images: [
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&h=800&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&h=800&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1200&h=800&fit=crop&auto=format'
    ],
    rating: 4.8,
    reviews: 33,
    featured: true
  },
  {
    id: 'p009',
    name: 'Villa Cố Hội An',
    resort: 'Hoi An Heritage',
    location: 'Cẩm An',
    province: 'Hội An',
    description: 'Villa phong cách Hội An cổ kính kết hợp tiện nghi hiện đại tại khu nghỉ dưỡng Heritage Hội An. Kiến trúc mái ngói truyền thống, sân vườn tre xanh mát và hồ bơi tích hợp.',
    price: 1450,
    bedrooms: 4,
    bathrooms: 3,
    area: 340,
    type: 'villa',
    status: 'available',
    transactionType: 'buy',
    amenities: ['Hồ bơi riêng', 'Vườn Nhật', 'Xe đạp miễn phí', 'Lớp học nấu ăn', 'Yoga deck', 'Wifi cao tốc', 'Bếp full', 'Phòng trà', 'Dịch vụ giặt ủi', 'Tour văn hóa'],
    images: [
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&h=800&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1540541338537-b11f8a4f1e7a?w=1200&h=800&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&h=800&fit=crop&auto=format'
    ],
    rating: 4.7,
    reviews: 28,
    featured: true
  }
];

export const users: User[] = [
  {
    id: 'u001',
    name: 'Nguyễn Minh Tuấn',
    email: 'tuan.nguyen@gmail.com',
    phone: '0912 345 678',
    cmnd: '079088012345',
    address: '12 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh',
    role: 'user',
    status: 'active',
    joinDate: '2024-01-15',
    lastLogin: '2026-09-20',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&auto=format',
    totalBookings: 3,
    totalSpent: 650
  },
  {
    id: 'u002',
    name: 'Trần Thị Hương',
    email: 'huong.tran@company.vn',
    phone: '0987 654 321',
    cmnd: '079091054321',
    address: '45 Hoàng Diệu, Hải Châu, Đà Nẵng',
    role: 'user',
    status: 'active',
    joinDate: '2024-03-22',
    lastLogin: '2026-09-18',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=100&h=100&fit=crop&auto=format',
    totalBookings: 2,
    totalSpent: 340
  },
  {
    id: 'u003',
    name: 'Lê Văn Đức',
    email: 'duc.le@startup.io',
    phone: '0908 123 456',
    cmnd: '038087078901',
    address: '8 Trần Phú, Hà Nội',
    role: 'user',
    status: 'active',
    joinDate: '2024-06-10',
    lastLogin: '2026-09-15',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&auto=format',
    totalBookings: 1,
    totalSpent: 120
  },
  {
    id: 'u004',
    name: 'Phạm Thị Lan',
    email: 'lan.pham@business.com',
    phone: '0934 567 890',
    cmnd: '001082045678',
    address: '88 Lê Lợi, Bến Nghé, Quận 1, TP.HCM',
    role: 'user',
    status: 'banned',
    joinDate: '2023-11-08',
    lastLogin: '2025-12-01',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&auto=format',
    totalBookings: 0,
    totalSpent: 0
  },
  {
    id: 'u005',
    name: 'Hoàng Anh Khoa',
    email: 'admin@resortregistry.vn',
    phone: '0909 888 999',
    cmnd: '074080099888',
    address: '1 Đống Đa, Hà Nội',
    role: 'admin',
    status: 'active',
    joinDate: '2023-01-01',
    lastLogin: '2026-09-21',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop&auto=format',
    totalBookings: 0,
    totalSpent: 0
  }
];

export const bookings: Booking[] = [
  {
    id: 'BK-2026-001',
    userId: 'u001',
    propertyId: 'p001',
    propertyName: 'Biệt Thự Bãi Biển Azure',
    resort: 'Azure Bay Resort',
    userName: 'Nguyễn Minh Tuấn',
    userEmail: 'tuan.nguyen@gmail.com',
    userPhone: '0912 345 678',
    startDate: '2026-10-01',
    endDate: '2027-04-01',
    months: 6,
    basePrice: 510,
    processingFee: 25.5,
    deposit: 170,
    totalPrice: 705.5,
    status: 'confirmed',
    paymentStatus: 'paid',
    paymentMethod: 'Thẻ tín dụng Visa',
    createdAt: '2026-09-10',
    notes: 'Khách hàng VIP, yêu cầu dọn dẹp hằng ngày'
  },
  {
    id: 'BK-2026-002',
    userId: 'u002',
    propertyId: 'p003',
    propertyName: 'Villa Hội An Cổ Phố',
    resort: 'Heritage Hoi An Retreat',
    userName: 'Trần Thị Hương',
    userEmail: 'huong.tran@company.vn',
    userPhone: '0987 654 321',
    startDate: '2026-11-01',
    endDate: '2027-01-01',
    months: 2,
    basePrice: 130,
    processingFee: 6.5,
    deposit: 65,
    totalPrice: 201.5,
    status: 'confirmed',
    paymentStatus: 'paid',
    paymentMethod: 'Chuyển khoản ngân hàng',
    createdAt: '2026-09-15',
  },
  {
    id: 'BK-2026-003',
    userId: 'u003',
    propertyId: 'p002',
    propertyName: 'Pearl Island Penthouse',
    resort: 'Pearl Island Grand',
    userName: 'Lê Văn Đức',
    userEmail: 'duc.le@startup.io',
    userPhone: '0908 123 456',
    startDate: '2026-12-01',
    endDate: '2027-01-01',
    months: 1,
    basePrice: 120,
    processingFee: 6,
    deposit: 40,
    totalPrice: 166,
    status: 'pending',
    paymentStatus: 'unpaid',
    paymentMethod: 'Chưa thanh toán',
    createdAt: '2026-09-18',
    notes: 'Yêu cầu thêm giường phụ'
  },
  {
    id: 'BK-2026-004',
    userId: 'u001',
    propertyId: 'p005',
    propertyName: 'Cliffside Villa Mũi Né',
    resort: 'Mui Ne Summit Resort',
    userName: 'Nguyễn Minh Tuấn',
    userEmail: 'tuan.nguyen@gmail.com',
    userPhone: '0912 345 678',
    startDate: '2025-06-01',
    endDate: '2025-09-01',
    months: 3,
    basePrice: 225,
    processingFee: 11.25,
    deposit: 75,
    totalPrice: 311.25,
    status: 'completed',
    paymentStatus: 'paid',
    paymentMethod: 'Thẻ tín dụng Mastercard',
    createdAt: '2025-05-10',
  },
  {
    id: 'BK-2025-005',
    userId: 'u002',
    propertyId: 'p004',
    propertyName: 'Coral Bay Bungalow',
    resort: 'Coral Bay Resort',
    userName: 'Trần Thị Hương',
    userEmail: 'huong.tran@company.vn',
    userPhone: '0987 654 321',
    startDate: '2025-01-01',
    endDate: '2025-03-01',
    months: 2,
    basePrice: 110,
    processingFee: 5.5,
    deposit: 55,
    totalPrice: 170.5,
    status: 'completed',
    paymentStatus: 'paid',
    paymentMethod: 'Ví điện tử MoMo',
    createdAt: '2024-12-15',
  },
  {
    id: 'BK-2025-006',
    userId: 'u001',
    propertyId: 'p003',
    propertyName: 'Villa Hội An Cổ Phố',
    resort: 'Heritage Hoi An Retreat',
    userName: 'Nguyễn Minh Tuấn',
    userEmail: 'tuan.nguyen@gmail.com',
    userPhone: '0912 345 678',
    startDate: '2024-03-01',
    endDate: '2024-05-01',
    months: 2,
    basePrice: 130,
    processingFee: 6.5,
    deposit: 65,
    totalPrice: 201.5,
    status: 'cancelled',
    paymentStatus: 'refunded',
    paymentMethod: 'Thẻ tín dụng Visa',
    createdAt: '2024-02-20',
    notes: 'Hủy do lý do cá nhân, hoàn tiền 80%'
  }
];

export const fees: Fee[] = [
  {
    id: 'f001',
    name: 'Phí Xử Lý Hồ Sơ',
    type: 'percentage',
    amount: 5,
    enabled: true,
    description: 'Phí xử lý và kiểm tra hồ sơ đăng ký',
    appliesTo: 'Tổng giá thuê'
  },
  {
    id: 'f002',
    name: 'Đặt Cọc An Toàn',
    type: 'percentage',
    amount: 33.3,
    enabled: true,
    description: 'Tiền đặt cọc bảo đảm, hoàn trả khi kết thúc hợp đồng',
    appliesTo: 'Tháng đầu tiên'
  },
  {
    id: 'f003',
    name: 'Phí Hủy Đặt Chỗ (trước 30 ngày)',
    type: 'percentage',
    amount: 20,
    enabled: true,
    description: 'Phí hủy nếu thông báo trước 30 ngày',
    appliesTo: 'Tổng đặt cọc'
  },
  {
    id: 'f004',
    name: 'Phí Hủy Đặt Chỗ (trong vòng 30 ngày)',
    type: 'percentage',
    amount: 50,
    enabled: true,
    description: 'Phí hủy nếu thông báo trong vòng 30 ngày',
    appliesTo: 'Tổng đặt cọc'
  },
  {
    id: 'f005',
    name: 'Phí Dịch Vụ Bổ Sung',
    type: 'fixed',
    amount: 2,
    enabled: false,
    description: 'Phí dịch vụ phụ trội hàng tháng',
    appliesTo: 'Mỗi tháng'
  }
];

export const revenueData = [
  { month: 'T1', revenue: 420, bookings: 8 },
  { month: 'T2', revenue: 380, bookings: 6 },
  { month: 'T3', revenue: 510, bookings: 9 },
  { month: 'T4', revenue: 650, bookings: 12 },
  { month: 'T5', revenue: 720, bookings: 14 },
  { month: 'T6', revenue: 890, bookings: 18 },
  { month: 'T7', revenue: 1050, bookings: 21 },
  { month: 'T8', revenue: 980, bookings: 19 },
  { month: 'T9', revenue: 760, bookings: 15 },
  { month: 'T10', revenue: 820, bookings: 16 },
  { month: 'T11', revenue: 690, bookings: 13 },
  { month: 'T12', revenue: 940, bookings: 20 },
];

export const bookingStatusData = [
  { name: 'Đã Xác Nhận', value: 45, color: '#2D7A4F' },
  { name: 'Đang Chờ', value: 20, color: '#D4860B' },
  { name: 'Hoàn Thành', value: 28, color: '#1B5E7A' },
  { name: 'Đã Hủy', value: 7, color: '#C0392B' },
];

export const currentUser: User = users[0];
export const adminUser: User = users[4];
