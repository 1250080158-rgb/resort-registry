# ResortRegistry 🏖

Nền tảng đăng ký thuê / mua nhà ở khu nghỉ dưỡng hàng đầu Việt Nam — tìm nhà, đặt chỗ online, thanh toán, chat trực tiếp với nhân viên và quản trị toàn bộ hệ thống qua trang Admin.

Website: [ResortRegistry](https://resortregistry.vercel.app)

**Stack:** React 19 + Vite 8 + TypeScript + Tailwind CSS v4 · Spring Boot 3.2 (Java 17) + Spring Security JWT + Flyway · SQL Server (prod) / H2 (dev)

---

## 1. Yêu cầu máy

| Thành phần | Phiên bản | Ghi chú |
|---|---|---|
| JDK | 17+ | chạy backend Spring Boot |
| Node.js | 18+ | chạy frontend Vite |
| SQL Server | 2019/2022 | **tùy chọn** — chỉ cần khi muốn dữ liệu lưu thật |

## 2. Cách chạy chương trình

### 2.1. Chế độ Dev nhanh (H2 in-memory — không cần cài gì)

> Dữ liệu nằm trong RAM, **mất khi restart** backend. Phù hợp demo nhanh.

```bat
:: Cửa sổ 1 — backend (port 8080)
mvnw.cmd spring-boot:run

:: Cửa sổ 2 — frontend
npm install
npm run dev
```

Mở trình duyệt: **http://localhost:8443** (backend API tại `http://localhost:8080/api`).

### 2.2. Chế độ SQL Server thật (khuyến nghị)

> Dữ liệu lưu vĩnh viễn trong database `ResortRegistry`, Flyway tự tạo schema + seed.

**Bước 1 — Đặt mật khẩu user `sa`** (chỉ làm 1 lần; cần chạy bằng tài khoản Windows có quyền admin SQL):

```bat
sqlcmd -S localhost -E -C -Q "ALTER LOGIN sa ENABLE; ALTER LOGIN sa WITH PASSWORD = 'MatKhauCuaBan123!'"
```

**Bước 2 — Dọn schema cũ** (chỉ làm 1 lần nếu DB đã có bảng cũ lệch schema — ví dụ tạo tay bằng `schema.sql`):

```bat
sqlcmd -S localhost -E -C -d ResortRegistry -Q "DROP TABLE IF EXISTS bookings, fees, properties, users;"
```

**Bước 3 — Chạy backend bằng script** (tự hỏi mật khẩu, tự đặt JWT secret):

```bat
start-sqlserver.bat
```

Tương đương lệnh tay:

```bat
set DB_USER=sa
set DB_PASSWORD=MatKhauCuaBan123!
set JWT_SECRET=chuoi-bi-mat-cua-ban
mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=prod
```

> Muốn không gõ mật khẩu lại: `setx DB_PASSWORD "MatKhauCuaBan123!"` rồi mở terminal mới.

**Bước 4 — Kiểm tra kết nối:**

```bat
curl http://localhost:8080/api/properties
```

Lần đầu khởi động sẽ thấy trong log: `Successfully applied 2 migrations` (Flyway tạo **10 bảng** từ `V1__init.sql` + `V2__settings_and_password_reset.sql`) và seed dữ liệu demo tự chạy.

### 2.3. Build frontend production

```bat
npm run build
```

Kết quả ở `dist/` — cấu hình deployment đầy đủ xem `DEPLOYMENT_GUIDE.md` (lưu ý: phần chạy `schema.sql` tay trong file đó đã lỗi thời, thay bằng Flyway ở mục 2.2).

### 2.4. Tài khoản demo (được seed tự động)

| Vai trò | Email | Mật khẩu |
|---|---|---|
| Người dùng | `tuan.nguyen@gmail.com` | `123456` |
| Quản trị viên | `admin@resortregistry.vn` | `admin123` |

---

## 3. Danh sách chức năng đã làm

### 👤 Người dùng

- **Trang chủ**: hero, tìm kiếm nhanh, nhà nổi bật.
- **Danh sách nhà**: lọc theo tỉnh/thành, loại nhà, khoảng giá, số phòng ngủ, tiện nghi, hình thức thuê/bán; sắp xếp theo giá/đánh giá; xem dạng grid/list.
- **Chi tiết tài sản**: gallery ảnh, tiện nghi, **báo giá server-side** (phí xử lý + đặt cọc tính từ bảng phí trong DB), kiểm tra lịch trống theo khoảng thời gian, **đặt lịch xem nhà** (chọn ngày/giờ gửi tới admin) cho cả nhà thuê lẫn nhà bán.
- **Đặt chỗ 3 bước** → xác nhận → thanh toán (thẻ tín dụng / chuyển khoản / MoMo — mô phỏng, server tự tính tiền, client không thể giả mạo tổng).
- **Lịch sử đặt chỗ**: lọc theo trạng thái, tìm kiếm, **tự hủy đơn** (chỉ đơn của mình), **xuất PDF biên nhận thật** (jsPDF).
- **Hồ sơ cá nhân**: sửa thông tin, **đổi mật khẩu**, xem tổng chi tiêu, **quản lý lịch hẹn xem nhà** (hủy được).
- **Quên mật khẩu**: phát hành token một-lần hết hạn 30 phút, gửi email khi cấu hình SMTP (chế độ dev trả token trực tiếp để test).
- **Chat realtime** với admin qua WebSocket (STOMP), tự fallback REST khi mất kết nối.
- Đăng ký tài khoản (validate email/SĐT/CMND trùng).

### 🛡 Quản trị viên

- **Dashboard**: tổng doanh thu, đặt chỗ hoạt động, người dùng hoạt động, nhà trống; biểu đồ doanh thu 12 tháng, phân bổ trạng thái, số đặt chỗ theo tháng.
- **Quản lý nhà**: thêm/sửa/xóa, **upload ảnh thật** (lưu `uploads/`), **grid chọn 15 tiện nghi**, **toggle Nổi Bật ★**, bật/tắt trạng thái (trống/bảo trì), hình thức thuê/bán.
- **Quản lý người dùng**: tìm/lọc, đổi vai trò, khóa/mở khóa tài khoản, xem chi tiết.
- **Quản lý đặt chỗ**: đổi trạng thái (chờ/xác nhận/hoàn thành/hủy), **hoàn tiền**, xuất **PDF báo cáo chi tiết**.
- **Quản lý lịch hẹn xem nhà**: lọc, xác nhận/hoàn thành/hủy, xóa, tìm theo khách.
- **Quản lý phí**: thêm/sửa/bật-tắt loại phí (%, cố định) — mọi báo giá và booking lấy số tiền từ bảng này.
- **Chat**: hộp thư nhiều hội thoại, trả lời khách realtime, đánh dấu đã đọc.
- **Cài đặt hệ thống**: lưu thật xuống bảng `app_settings` (thông tin web, cổng thanh toán, bảo mật, thông báo).
- **Xuất Excel .xlsx** cho cả 4 bảng quản lý (xuất đúng dữ liệu đang lọc) + **phân trang** (8 dòng/trang, tự về trang 1 khi đổi bộ lọc).

### 🔒 Bảo mật

- JWT (hết hạn 24h), mật khẩu BCrypt.
- Khóa tài khoản tự động khi sai mật khẩu 5 lần (mở khóa sau 15 phút).
- Phân quyền: endpoint ADMIN riêng (dashboard, fees, settings, ghi tài sản, xem toàn bộ user/booking...); user chỉ xem/sửa **của chính mình** (kiểm tra ownership trong controller cho booking, chat, lịch hẹn).
- Tự dọn phiên khi token hết hạn (401 → về trạng thái chưa đăng nhập).

## 4. Cấu trúc dự án

```
├── start-sqlserver.bat          # Script chạy backend với SQL Server (prod profile)
├── mvnw.cmd                     # Maven wrapper
├── pom.xml                      # Dependency backend
├── src/
│   ├── main/java/com/resortregistry/
│   │   ├── controller/          # REST API (Auth, Property, Booking, Appointment,
│   │   │                        #   Payment, Fee, User, Chat, Setting, Dashboard)
│   │   ├── service/             # Nghiệp vụ (Booking, Payment, Fee, Email, PasswordReset, ...)
│   │   ├── repository/          # Truy vấn JPA
│   │   ├── entity/              # 9 entity ánh xạ bảng DB
│   │   ├── security/            # JWT filter, CurrentUser, handshake WebSocket
│   │   ├── config/              # SecurityConfig, WebSocket, DataInitializer (seed)
│   │   └── dto/                 # Request/Response DTO
│   ├── main/resources/
│   │   ├── db/migration/        # V1__init.sql, V2__settings_and_password_reset.sql
│   │   ├── application.properties        # Cấu hình dev (H2)
│   │   └── application-prod.properties   # Cấu hình SQL Server (prod profile)
│   └── test/java/...            # ApiSecurityAndBookingFlowTests (7 test)
├── src/ (frontend)              # ⚠ chung thư mục src với backend
│   ├── App.tsx                  # Điều hướng view
│   ├── components/user|admin|shared|chat/
│   ├── utils/api.ts             # Toàn bộ REST client + kiểu dữ liệu
│   └── utils/pdfExport.ts | excelExport.ts
```

## 5. Database

- **Dev**: H2 in-memory (`jdbc:h2:mem:testdb`), Hibernate tự tạo bảng từ entity, seed bằng `DataInitializer`.
- **Prod**: SQL Server `localhost:1433` / database `ResortRegistry`, **Flyway** quản schema qua `V1__init.sql` + `V2__settings_and_password_reset.sql`, Hibernate chỉ `validate`.
- **10 bảng**: `users`, `properties`, `bookings`, `fees`, `payment_transactions`, `appointments`, `chats`, `app_settings`, `password_reset_tokens`, `flyway_schema_history`.
- Thêm cột/bảng mới → tạo file `V3__<mo_ta>.sql` trong `db/migration/` (không sửa V1/V2 đã chạy).

## 6. API chính

| Nhóm | Endpoint tiêu biểu |
|---|---|
| Auth | `POST /api/auth/login` · `/register` · `/forgot-password` · `/reset-password` |
| Tài sản | `GET /api/properties` (+ `/search`, `/featured`, `/available-featured`) · CRUD (ADMIN) · `POST /api/properties/{id}/images` |
| Đặt chỗ | `GET /api/bookings/quote` · `/availability` · `POST /api/bookings` · `PUT /api/bookings/{id}/status` · `/payment` |
| Lịch hẹn | `GET /api/appointments` (ADMIN) · `/customer/{id}` · `POST /api/appointments` · `PUT /{id}/status` |
| Thanh toán | `POST /api/payments` · `GET /api/payments/booking/{id}` · `POST .../refund` |
| Phí / Cài đặt | CRUD `/api/fees` (ADMIN) · `GET|PUT /api/settings` (ADMIN) |
| Chat | REST `/api/chats/**` + WebSocket `/ws` (topic `/topic/chat/{customerId}/{staffId}`) |
| Dashboard | `/api/dashboard/stats` · `/revenue` · `/booking-status` (ADMIN) |

## 7. Kiểm thử & kiểm chứng

```bat
mvnw.cmd test          :: backend — 7/7 test pass (bảo mật + luồng booking)
npx tsc --noEmit       :: frontend — 0 lỗi TypeScript
npm run build          :: build production OK
```

Đã kiểm chứng end-to-end: khởi động profile prod trên SQL Server thật → Flyway tạo 10 bảng → seed dữ liệu → đăng nhập JWT → API hoạt động.

## 8. Việc còn lại (chưa làm)

- [ ] Yêu thích (wishlist), đánh giá sau khi ở (review)
- [ ] Cổng thanh toán thật (VNPay/MoMo/Stripe — hiện mô phỏng)
- [ ] Vai trò STAFF (enum có sẵn nhưng chưa có luồng quản lý)
- [ ] Bản đồ vị trí thật, trang Điều khoản/Chính sách nội dung
- [ ] Phân trang server-side, routing URL thật (react-router), i18n, dark mode
- [ ] Xuất PDF bằng thư viện chọn văn bản (hiện rasterize ảnh — in đẹp nhưng không copy được chữ)

---

*Ghi chú mật khẩu: không commit `DB_PASSWORD`/`JWT_SECRET` vào git — luôn dùng biến môi trường hoặc `setx`.*
