const API_BASE_URL = typeof window !== 'undefined' && window.location.port !== '8080'
  ? '/api'
  : 'http://localhost:8080/api';

const SERVER_UNAVAILABLE = 'Máy chủ tạm thời chưa sẵn sàng. Vui lòng thử lại sau.';

const GATEWAY_STATUSES = [404, 502, 503, 504];

// Helper lấy token JWT từ localStorage
const getToken = () => localStorage.getItem('rr_token');

// Wrapper fetch: gắn Bearer token, hỗ trợ timeout qua AbortController, tự dọn phiên khi 401
const apiFetch = async (url: string, options: RequestInit = {}, timeoutMs?: number): Promise<Response> => {
  const controller = new AbortController();
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  if (timeoutMs) {
    timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  }
  try {
    const token = getToken();
    const headers = new Headers(options.headers || {});
    if (typeof options.body === 'string' && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }
    if (token) headers.set('Authorization', `Bearer ${token}`);
    const response = await fetch(url, { ...options, headers, signal: controller.signal });
    if (response.status === 401 && !url.includes('/api/auth/')) {
      localStorage.removeItem('rr_token');
      localStorage.removeItem('rr_user');
      window.location.reload(); // quay về trạng thái chưa đăng nhập
    }
    return response;
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
};

// Phân tích JSON từ response; ném SERVER_UNAVAILABLE khi mạng lỗi, gateway lỗi (404/502/503/504),
// Content-Type không phải JSON, hoặc json() ném lỗi. Giữ nguyên thông báo cụ thể nếu server trả JSON có trường error.
const fetchJson = async (response: Response, fallbackMessage: string = SERVER_UNAVAILABLE): Promise<any> => {
  if (response.status === 0) throw new Error(SERVER_UNAVAILABLE);
  if (GATEWAY_STATUSES.includes(response.status)) throw new Error(SERVER_UNAVAILABLE);
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) throw new Error(SERVER_UNAVAILABLE);
  let data: any;
  try {
    data = await response.json();
  } catch {
    throw new Error(SERVER_UNAVAILABLE);
  }
  if (!response.ok) {
    if (data && data.error) throw new Error(data.error);
    throw new Error(fallbackMessage);
  }
  return data;
};

// Kiểm tra trạng thái response cho các lệnh ghi (POST/PUT/DELETE) mà không cần parse body lại
const ensureOk = async (response: Response, fallback: string = SERVER_UNAVAILABLE) => {
  if (response.status === 0) throw new Error(SERVER_UNAVAILABLE);
  if (GATEWAY_STATUSES.includes(response.status)) throw new Error(SERVER_UNAVAILABLE);
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) throw new Error(SERVER_UNAVAILABLE);
  if (!response.ok) throw new Error(fallback);
};

export interface AuthSuccess {
  token: string;
  user: User;
}

export interface Property {
  id: number;
  name: string;
  resort: string;
  location: string;
  province: string;
  description: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  area: number;
  type: 'VILLA' | 'PENTHOUSE' | 'BUNGALOW' | 'APARTMENT';
  status: 'AVAILABLE' | 'BOOKED' | 'MAINTENANCE';
  transactionType: 'RENT' | 'BUY';
  amenities: string;
  images: string;
  rating: number;
  reviews: number;
  floorLevel?: number;
  featured?: boolean;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  cmnd: string;
  address: string;
  role: 'USER' | 'STAFF' | 'ADMIN';
  status: 'ACTIVE' | 'INACTIVE' | 'BANNED';
  joinDate: string;
  lastLogin?: string;
  avatar: string;
  totalBookings: number;
  totalSpent: number;
}

export interface Booking {
  id: number;
  userId: number;
  propertyId: number;
  propertyName: string;
  resort: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  startDate: string;
  endDate: string;
  months: number;
  transactionType: 'RENT' | 'BUY';
  basePrice: number;
  processingFee: number;
  deposit: number;
  totalPrice: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  paymentStatus: 'UNPAID' | 'PAID' | 'REFUNDED';
  paymentMethod?: string;
  notes?: string;
  createdAt: string;
}

export interface Fee {
  id: number;
  name: string;
  type: 'PERCENTAGE' | 'FIXED';
  amount: number;
  enabled: boolean;
  description: string;
  appliesTo: string;
}

// Request tạo booking — server tự tính giá, client KHÔNG gửi giá
export interface CreateBookingRequest {
  userId: number;
  propertyId: number;
  months: number;
  startDate: string; // yyyy-MM-dd
  notes?: string;
  paymentMethod?: string;
}

// Kết quả tính giá server-side (từ bảng fees)
export interface QuoteResult {
  propertyId: number;
  months: number;
  monthlyPrice: number;
  basePrice: number;
  processingFee: number;
  deposit: number;
  total: number;
}

export interface RegisterData {
  name: string;
  email: string;
  phone: string;
  cmnd: string;
  address: string;
  password: string;
}

// Auth API
export const authApi = {
  login: async (email: string, password: string): Promise<AuthSuccess> => {
    const response = await apiFetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return fetchJson(response, 'Đăng nhập thất bại');
  },

  register: async (userData: RegisterData): Promise<AuthSuccess> => {
    const response = await apiFetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return fetchJson(response, 'Đăng ký thất bại');
  },

  // Quên mật khẩu: server phát hành token và gửi email.
  // Ở dev (chưa cấu hình SMTP) server trả thêm devToken để tự đặt lại mật khẩu.
  forgotPassword: async (email: string): Promise<{ message: string; devToken?: string }> => {
    const response = await apiFetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return fetchJson(response, 'Gửi yêu cầu thất bại');
  },

  // Đặt lại mật khẩu bằng token nhận từ email
  resetPassword: async (token: string, newPassword: string): Promise<string> => {
    const response = await apiFetch(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword }),
    });
    const data = await fetchJson(response, 'Đặt lại mật khẩu thất bại');
    return data.message;
  },
};

// Property API
export const propertyApi = {
  getAll: async (): Promise<Property[]> => {
    const response = await apiFetch(`${API_BASE_URL}/properties`, {}, 5000);
    return fetchJson(response, 'Failed to fetch properties');
  },
  
  getById: async (id: number): Promise<Property> => {
    const response = await apiFetch(`${API_BASE_URL}/properties/${id}`, {}, 5000);
    return fetchJson(response, 'Failed to fetch property');
  },
  
  getAvailable: async (): Promise<Property[]> => {
    const response = await apiFetch(`${API_BASE_URL}/properties/available`, {}, 5000);
    return fetchJson(response, 'Failed to fetch available properties');
  },
  
  getFeatured: async (): Promise<Property[]> => {
    const response = await apiFetch(`${API_BASE_URL}/properties/featured`, {}, 5000);
    return fetchJson(response, 'Failed to fetch featured properties');
  },
  
  getAvailableFeatured: async (): Promise<Property[]> => {
    const response = await apiFetch(`${API_BASE_URL}/properties/available-featured`, {}, 5000);
    return fetchJson(response, 'Failed to fetch available featured properties');
  },
  
  search: async (keyword: string): Promise<Property[]> => {
    const response = await apiFetch(`${API_BASE_URL}/properties/search?keyword=${encodeURIComponent(keyword)}`, {}, 5000);
    return fetchJson(response, 'Failed to search properties');
  },
  
  getByType: async (type: string): Promise<Property[]> => {
    const response = await apiFetch(`${API_BASE_URL}/properties/type/${type}`, {}, 5000);
    return fetchJson(response, 'Failed to fetch properties by type');
  },
  
  getByProvince: async (province: string): Promise<Property[]> => {
    const response = await apiFetch(`${API_BASE_URL}/properties/province/${encodeURIComponent(province)}`, {}, 5000);
    return fetchJson(response, 'Failed to fetch properties by province');
  },
  
  create: async (property: Property): Promise<Property> => {
    const response = await apiFetch(`${API_BASE_URL}/properties`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(property),
    });
    await ensureOk(response, 'Failed to create property');
    return response.json();
  },
  
  update: async (id: number, property: Property): Promise<Property> => {
    const response = await apiFetch(`${API_BASE_URL}/properties/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(property),
    });
    await ensureOk(response, 'Failed to update property');
    return response.json();
  },
  
  delete: async (id: number): Promise<void> => {
    const response = await apiFetch(`${API_BASE_URL}/properties/${id}`, {
      method: 'DELETE',
    });
    await ensureOk(response, 'Failed to delete property');
  },

  // Tải ảnh thật lên tài sản (multipart); trả về property với URL mới trong images
  uploadImage: async (id: number, file: File): Promise<Property> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiFetch(`${API_BASE_URL}/properties/${id}/images`, {
      method: 'POST',
      body: formData,
    });
    await ensureOk(response, 'Tải ảnh lên thất bại');
    return response.json();
  },
};
export const userApi = {
  getAll: async (): Promise<User[]> => {
    const response = await apiFetch(`${API_BASE_URL}/users`);
    await ensureOk(response, 'Failed to fetch users');
    return response.json();
  },
  
  getById: async (id: number): Promise<User> => {
    const response = await apiFetch(`${API_BASE_URL}/users/${id}`);
    await ensureOk(response, 'Failed to fetch user');
    return response.json();
  },
  
  getByEmail: async (email: string): Promise<User> => {
    const response = await apiFetch(`${API_BASE_URL}/users/email/${encodeURIComponent(email)}`);
    await ensureOk(response, 'Failed to fetch user by email');
    return response.json();
  },
  
  getByRole: async (role: string): Promise<User[]> => {
    const response = await apiFetch(`${API_BASE_URL}/users/role/${role}`);
    await ensureOk(response, 'Failed to fetch users by role');
    return response.json();
  },
  
  getActive: async (): Promise<User[]> => {
    const response = await apiFetch(`${API_BASE_URL}/users/active`);
    await ensureOk(response, 'Failed to fetch active users');
    return response.json();
  },
  
  create: async (user: User): Promise<User> => {
    const response = await apiFetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
    });
    await ensureOk(response, 'Failed to create user');
    return response.json();
  },
  
  update: async (id: number, user: User): Promise<User> => {
    const response = await apiFetch(`${API_BASE_URL}/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
    });
    await ensureOk(response, 'Failed to update user');
    return response.json();
  },
  
  delete: async (id: number): Promise<void> => {
    const response = await apiFetch(`${API_BASE_URL}/users/${id}`, {
      method: 'DELETE',
    });
    await ensureOk(response, 'Failed to delete user');
  },
  
  updateLastLogin: async (id: number): Promise<User> => {
    const response = await apiFetch(`${API_BASE_URL}/users/${id}/login`, {
      method: 'POST',
    });
    await ensureOk(response, 'Failed to update last login');
    return response.json();
  },

  changePassword: async (id: number, currentPassword: string, newPassword: string, confirmPassword: string): Promise<void> => {
    const response = await apiFetch(`${API_BASE_URL}/users/${id}/change-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Đổi mật khẩu thất bại');
  },
};

// Chat API
export interface ChatMsg {
  id: number;
  customerId: number;
  staffId: number;
  senderId: number;
  message: string;
  senderName?: string;
  senderRole?: string;
  isRead?: boolean;
  createdAt?: string;
}

export const chatApi = {
  // Nhân viên hỗ trợ mặc định (ADMIN trước, fallback STAFF)
  getSupport: async (): Promise<User> => {
    const response = await apiFetch(`${API_BASE_URL}/chats/support`);
    await ensureOk(response, 'Không tìm thấy nhân viên hỗ trợ');
    return response.json();
  },

  getBetween: async (customerId: number, staffId: number): Promise<ChatMsg[]> => {
    const response = await apiFetch(`${API_BASE_URL}/chats/between/${customerId}/${staffId}`);
    await ensureOk(response, 'Không tải được tin nhắn');
    return response.json();
  },

  getByStaff: async (staffId: number): Promise<ChatMsg[]> => {
    const response = await apiFetch(`${API_BASE_URL}/chats/staff/${staffId}`);
    await ensureOk(response, 'Không tải được tin nhắn');
    return response.json();
  },

  markAllAsRead: async (customerId: number, staffId: number): Promise<void> => {
    const response = await apiFetch(`${API_BASE_URL}/chats/between/${customerId}/${staffId}/read-all`, {
      method: 'PUT',
    });
    await ensureOk(response, 'Không cập nhật được trạng thái đã đọc');
  },

  // Gửi dự phòng qua REST khi WebSocket không kết nối được
  sendRest: async (customerId: number, staffId: number, message: string): Promise<ChatMsg> => {
    const response = await apiFetch(`${API_BASE_URL}/chats`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customerId, staffId, message }),
    });
    const data = await response.json();
    await ensureOk(response, 'Gửi tin nhắn thất bại');
    return data.chat;
  },
};

// Payment API (giao dịch thanh toán mô phỏng)
export interface PaymentTx {
  id: number;
  bookingId: number;
  amount: number;
  method: string;
  status: 'SUCCESS' | 'FAILED' | 'REFUNDED';
  reference: string;
  createdAt: string;
}

export const paymentApi = {
  pay: async (bookingId: number, method: string): Promise<PaymentTx> => {
    const response = await apiFetch(`${API_BASE_URL}/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId, method }),
    });
    const data = await response.json();
    await ensureOk(response, 'Thanh toán thất bại');
    return data;
  },

  getByBooking: async (bookingId: number): Promise<PaymentTx[]> => {
    const response = await apiFetch(`${API_BASE_URL}/payments/booking/${bookingId}`);
    await ensureOk(response, 'Không tải được giao dịch');
    return response.json();
  },

  refund: async (bookingId: number): Promise<PaymentTx> => {
    const response = await apiFetch(`${API_BASE_URL}/payments/booking/${bookingId}/refund`, {
      method: 'POST',
    });
    const data = await response.json();
    await ensureOk(response, 'Hoàn tiền thất bại');
    return data;
  },

  confirmPayment: async (transactionId: number): Promise<PaymentTx> => {
    const response = await apiFetch(`${API_BASE_URL}/payments/confirm/${transactionId}`, {
      method: 'POST',
    });
    const data = await response.json();
    await ensureOk(response, 'Xác nhận thanh toán thất bại');
    return data;
  },
};

// Booking API
export const bookingApi = {
  getAll: async (): Promise<Booking[]> => {
    const response = await apiFetch(`${API_BASE_URL}/bookings`);
    await ensureOk(response, 'Failed to fetch bookings');
    return response.json();
  },
  
  getById: async (id: number): Promise<Booking> => {
    const response = await apiFetch(`${API_BASE_URL}/bookings/${id}`);
    await ensureOk(response, 'Failed to fetch booking');
    return response.json();
  },
  
  getByUserId: async (userId: number): Promise<Booking[]> => {
    const response = await apiFetch(`${API_BASE_URL}/bookings/user/${userId}`);
    await ensureOk(response, 'Failed to fetch bookings by user');
    return response.json();
  },
  
  getByPropertyId: async (propertyId: number): Promise<Booking[]> => {
    const response = await apiFetch(`${API_BASE_URL}/bookings/property/${propertyId}`);
    await ensureOk(response, 'Failed to fetch bookings by property');
    return response.json();
  },

  // Báo giá server-side (phí xử lý + đặt cọc + tổng) theo bảng fees hiện tại
  quote: async (propertyId: number, months: number): Promise<QuoteResult> => {
    const response = await apiFetch(`${API_BASE_URL}/bookings/quote?propertyId=${propertyId}&months=${months}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to get quote');
    return data;
  },

  // Kiểm tra tài sản còn trống cho khoảng thời gian (server check trùng lịch)
  checkAvailability: async (propertyId: number, startDate: string, months: number): Promise<boolean> => {
    const response = await apiFetch(
      `${API_BASE_URL}/bookings/availability?propertyId=${propertyId}&startDate=${startDate}&months=${months}`
    );
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to check availability');
    return data.available;
  },
  
  getByStatus: async (status: string): Promise<Booking[]> => {
    const response = await apiFetch(`${API_BASE_URL}/bookings/status/${status}`);
    await ensureOk(response, 'Failed to fetch bookings by status');
    return response.json();
  },
  
  create: async (request: CreateBookingRequest): Promise<Booking> => {
    const response = await apiFetch(`${API_BASE_URL}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to create booking');
    return data;
  },
  
  updateStatus: async (id: number, status: string): Promise<Booking> => {
    const response = await apiFetch(`${API_BASE_URL}/bookings/${id}/status?status=${status}`, {
      method: 'PUT',
    });
    await ensureOk(response, 'Failed to update booking status');
    return response.json();
  },
  
  updatePaymentStatus: async (id: number, paymentStatus: string): Promise<Booking> => {
    const response = await apiFetch(`${API_BASE_URL}/bookings/${id}/payment?paymentStatus=${paymentStatus}`, {
      method: 'PUT',
    });
    await ensureOk(response, 'Failed to update payment status');
    return response.json();
  },
  
  delete: async (id: number): Promise<void> => {
    const response = await apiFetch(`${API_BASE_URL}/bookings/${id}`, {
      method: 'DELETE',
    });
    await ensureOk(response, 'Failed to delete booking');
  },
};

// Fee API
export const feeApi = {
  getAll: async (): Promise<Fee[]> => {
    const response = await apiFetch(`${API_BASE_URL}/fees`);
    await ensureOk(response, 'Failed to fetch fees');
    return response.json();
  },
  
  getById: async (id: number): Promise<Fee> => {
    const response = await apiFetch(`${API_BASE_URL}/fees/${id}`);
    await ensureOk(response, 'Failed to fetch fee');
    return response.json();
  },
  
  getEnabled: async (): Promise<Fee[]> => {
    const response = await apiFetch(`${API_BASE_URL}/fees/enabled`);
    await ensureOk(response, 'Failed to fetch enabled fees');
    return response.json();
  },
  
  getByType: async (type: string): Promise<Fee[]> => {
    const response = await apiFetch(`${API_BASE_URL}/fees/type/${type}`);
    await ensureOk(response, 'Failed to fetch fees by type');
    return response.json();
  },
  
  create: async (fee: Fee): Promise<Fee> => {
    const response = await apiFetch(`${API_BASE_URL}/fees`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fee),
    });
    await ensureOk(response, 'Failed to create fee');
    return response.json();
  },
  
  update: async (id: number, fee: Fee): Promise<Fee> => {
    const response = await apiFetch(`${API_BASE_URL}/fees/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fee),
    });
    await ensureOk(response, 'Failed to update fee');
    return response.json();
  },
  
  toggleEnabled: async (id: number): Promise<Fee> => {
    const response = await apiFetch(`${API_BASE_URL}/fees/${id}/toggle`, {
      method: 'PUT',
    });
    await ensureOk(response, 'Failed to toggle fee');
    return response.json();
  },
  
  delete: async (id: number): Promise<void> => {
    const response = await apiFetch(`${API_BASE_URL}/fees/${id}`, {
      method: 'DELETE',
    });
    await ensureOk(response, 'Failed to delete fee');
  },
};

// Dashboard API
export const dashboardApi = {
  getStats: async (): Promise<Record<string, any>> => {
    const response = await apiFetch(`${API_BASE_URL}/dashboard/stats`);
    await ensureOk(response, 'Failed to fetch dashboard stats');
    return response.json();
  },
  
  getRevenue: async (): Promise<Array<{ month: string; revenue: number; bookings: number }>> => {
    const response = await apiFetch(`${API_BASE_URL}/dashboard/revenue`);
    await ensureOk(response, 'Failed to fetch revenue data');
    return response.json();
  },
  
  getBookingStatus: async (): Promise<Array<{ name: string; value: number; color: string }>> => {
    const response = await apiFetch(`${API_BASE_URL}/dashboard/booking-status`);
    await ensureOk(response, 'Failed to fetch booking status data');
    return response.json();
  },
  
  getRecentBookings: async (): Promise<Booking[]> => {
    const response = await apiFetch(`${API_BASE_URL}/dashboard/recent-bookings`);
    await ensureOk(response, 'Failed to fetch recent bookings');
    return response.json();
  },
};

// Appointment API (lịch hẹn xem nhà)
export interface Appointment {
  id: number;
  customerId: number;
  staffId: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  staffName: string;
  appointmentDate: string; // ISO yyyy-MM-ddTHH:mm:ss
  reason: string;
  notes?: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  createdAt: string;
  updatedAt?: string;
}

export interface CreateAppointmentRequest {
  customerId: number;
  staffId: number;
  appointmentDate: string; // ISO yyyy-MM-ddTHH:mm:ss
  reason: string;
  notes?: string;
}

export const appointmentApi = {
  getAll: async (): Promise<Appointment[]> => {
    const response = await apiFetch(`${API_BASE_URL}/appointments`);
    await ensureOk(response, 'Không tải được danh sách lịch hẹn');
    return response.json();
  },

  getByCustomer: async (customerId: number): Promise<Appointment[]> => {
    const response = await apiFetch(`${API_BASE_URL}/appointments/customer/${customerId}`);
    await ensureOk(response, 'Không tải được lịch hẹn của bạn');
    return response.json();
  },

  // Server trả { success, message, appointment } — lấy trường appointment
  create: async (request: CreateAppointmentRequest): Promise<Appointment> => {
    const response = await apiFetch(`${API_BASE_URL}/appointments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Đặt lịch hẹn thất bại');
    return data.appointment;
  },

  updateStatus: async (id: number, status: string): Promise<Appointment> => {
    const response = await apiFetch(`${API_BASE_URL}/appointments/${id}/status?status=${status}`, {
      method: 'PUT',
    });
    await ensureOk(response, 'Cập nhật trạng thái lịch hẹn thất bại');
    return response.json();
  },

  delete: async (id: number): Promise<void> => {
    const response = await apiFetch(`${API_BASE_URL}/appointments/${id}`, {
      method: 'DELETE',
    });
    await ensureOk(response, 'Xóa lịch hẹn thất bại');
  },
};

// Setting API (cấu hình hệ thống, chỉ ADMIN)
export const settingApi = {
  getAll: async (): Promise<Record<string, string>> => {
    const response = await apiFetch(`${API_BASE_URL}/settings`);
    await ensureOk(response, 'Không tải được cài đặt hệ thống');
    return response.json();
  },

  // Cập nhật hàng loạt key-value, server trả lại Map sau khi lưu
  updateAll: async (settings: Record<string, string>): Promise<Record<string, string>> => {
    const response = await apiFetch(`${API_BASE_URL}/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    await ensureOk(response, 'Lưu cài đặt thất bại');
    return response.json();
  },
};