# Hướng dẫn triển khai và chạy ứng dụng Resort Registry

> ⚠️ **LƯU Ý QUAN TRỌNG**: Cách kết nối SQL Server đã được cập nhật — schema database
> giờ do **Flyway** quản lý tự động (thư mục `src/main/resources/db/migration/`), KHÔNG
> còn chạy `schema.sql` tay trong SSMS nữa. Hướng dẫn mới đầy đủ nhất xem **README.md**,
> hoặc chạy thẳng script `start-sqlserver.bat` ở gốc dự án. Các mục 1.3 và 1.4 dưới đây
> chỉ giữ lại để tham khảo cách làm cũ.

## Tổng quan
Đây là ứng dụng full-stack với:
- **Backend**: Spring Boot 3.2 + Spring MVC + Spring Data JPA
- **Database**: SQL Server
- **Frontend**: React + Vite + Tailwind CSS
- **Architecture**: Spring Boot serve React static files và REST API

## Cấu trúc dự án
```
E:\BAITAP\java\Ck\
├── src/
│   ├── main/
│   │   ├── java/com/resortregistry/      # Spring Boot backend
│   │   │   ├── entity/                   # JPA Entities
│   │   │   ├── repository/               # JPA Repositories
│   │   │   ├── service/                  # Business Logic
│   │   │   ├── controller/               # REST API Controllers
│   │   │   └── config/                   # Spring Configuration
│   │   └── resources/
│   │       ├── application.properties   # Spring Boot config (dev - H2)
│   │       ├── application-prod.properties # Spring Boot config (prod - SQL Server)
│   │       └── db/migration/             # Flyway migrations (V1, V2, ...)
│   └── frontend/                         # React frontend (giữ nguyên)
├── pom.xml                               # Maven configuration
├── package.json                          # Node.js dependencies
└── build-react.bat                       # Build script
```

## Yêu cầu hệ thống

### Phần mềm cần thiết:
1. **Java Development Kit (JDK) 17** trở lên
2. **Apache Maven 3.6+** 
3. **Node.js 18+** và **npm/pnpm**
4. **SQL Server** (Express hoặc Professional)

### Kiểm tra version:
```bash
java -version
mvn -version
node -version
npm -version
```

## Bước 1: Cấu hình SQL Server

### 1.1 Cài đặt SQL Server (nếu chưa có)
- Download SQL Server Express miễn phí từ Microsoft
- Cài đặt với Windows Authentication hoặc SQL Server Authentication

### 1.2 Tạo database
Mở **SQL Server Management Studio (SSMS)** và chạy script sau:

```sql
-- Tạo database ResortRegistry
CREATE DATABASE ResortRegistry;
GO

USE ResortRegistry;
GO
```

### 1.3 Schema database (ĐÃ CŨ — dùng Flyway)

> File `schema.sql` đã bị xóa. Khi chạy với profile prod
> (`mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=prod` hoặc `start-sqlserver.bat`),
> Flyway tự động tạo toàn bộ 10 bảng và seed dữ liệu demo từ các file migration
> `src/main/resources/db/migration/V1__init.sql` và `V2__settings_and_password_reset.sql`.
> Chỉ cần tạo database `ResortRegistry` như mục 1.2 rồi khởi động backend.

### 1.4 Cấu hình kết nối database
Mở file `src/main/resources/application.properties` và cập nhật thông tin SQL Server:

```properties
# Database Configuration
spring.datasource.url=jdbc:sqlserver://localhost:1433;databaseName=ResortRegistry;encrypt=true;trustServerCertificate=true
spring.datasource.username=sa              # Thay bằng username của bạn
spring.datasource.password=YourPassword    # Thay bằng password của bạn
spring.datasource.driver-class-name=com.microsoft.sqlserver.jdbc.SQLServerDriver
```

**Lưu ý:**
- Nếu dùng Windows Authentication, thay đổi connection string:
  ```properties
  spring.datasource.url=jdbc:sqlserver://localhost:1433;databaseName=ResortRegistry;encrypt=true;trustServerCertificate=true;integratedSecurity=true
  spring.datasource.username=
  spring.datasource.password=
  ```

## Bước 2: Build React App

### 2.1 Cài đặt dependencies
```bash
cd E:\BAITAP\java\Ck
npm install
```

### 2.2 Build React app cho production
```bash
npm run build:prod
```

Hoặc chạy script build (Windows):
```bash
build-react.bat
```

Script này sẽ:
- Build React app với config production
- Copy files vào `src/main/resources/static/`
- Chuẩn bị cho Spring Boot serve

### 2.3 Kiểm tra build
Kiểm tra thư mục `src/main/resources/static/` có chứa:
- `index.html`
- `assets/` (CSS, JS files)
- Các static files khác

## Bước 3: Chạy Spring Boot Application

### 3.1 Clean và build Maven project
```bash
mvn clean install
```

### 3.2 Chạy Spring Boot
```bash
mvn spring-boot:run
```

Hoặc chạy trực tiếp từ JAR file sau khi build:
```bash
mvn clean package
java -jar target/resort-registry-1.0.0.jar
```

### 3.3 Kiểm tra application
Mở browser và truy cập:
- **Frontend**: http://localhost:8080
- **API Health**: http://localhost:8080/api/properties

## Bước 4: Testing

### 4.1 Test Frontend
1. Truy cập http://localhost:8080
2. Kiểm tra trang Home có hiển thị properties từ database
3. Test navigation giữa các trang
4. Test search và filter functionality

### 4.2 Test API endpoints
Sử dụng Postman hoặc curl để test các endpoints:

```bash
# Get all properties
curl http://localhost:8080/api/properties

# Get featured properties
curl http://localhost:8080/api/properties/featured

# Get all users
curl http://localhost:8080/api/users

# Get dashboard stats
curl http://localhost:8080/api/dashboard/stats
```

### 4.3 Test Database connection
Kiểm tra console log của Spring Boot để đảm bảo:
- Database connection thành công
- Tables được tạo/được mapping đúng
- Không có lỗi SQL

## Troubleshooting

### Lỗi kết nối SQL Server
**Problem**: `Cannot open database "ResortRegistry" requested by the login`
**Solution**: 
- Đảm bảo database đã được tạo
- Kiểm tra username/password trong application.properties
- Kiểm tra SQL Server service đang chạy

### Lỗi Port đang được sử dụng
**Problem**: `Port 8080 is already in use`
**Solution**:
- Thay đổi port trong application.properties: `server.port=8081`
- Hoặc kill process đang dùng port 8080

### React build lỗi
**Problem**: Build React app thất bại
**Solution**:
- Xóa `node_modules` và `package-lock.json`
- Chạy lại `npm install`
- Kiểm tra Node.js version (cần 18+)

### Static files không load
**Problem**: Frontend load nhưng CSS/JS không hoạt động
**Solution**:
- Đảm bảo đã chạy `npm run build:prod`
- Kiểm tra files trong `src/main/resources/static/`
- Restart Spring Boot application

### CORS errors
**Problem**: API calls bị block bởi CORS
**Solution**:
- Controllers đã có `@CrossOrigin(origins = "*")`
- Nếu vẫn lỗi, kiểm tra browser console và server logs

## Development Workflow

### Chạy trong development mode
1. **Start Spring Boot backend**:
   ```bash
   mvn spring-boot:run
   ```

2. **Start React dev server** (trong terminal khác):
   ```bash
   npm run dev
   ```

3. React dev server sẽ proxy API calls đến Spring Boot (đã cấu hình trong vite.config.prod.ts)

### Production build
1. Build React app: `npm run build:prod`
2. Build Maven: `mvn clean package`
3. Run JAR: `java -jar target/resort-registry-1.0.0.jar`

## Tích hợp thêm các components

Theo hướng dẫn trong `API_INTEGRATION_GUIDE.md` để cập nhật các React components còn lại để gọi API thay vì mock data.

Các components cần cập nhật:
- ListingsPage.tsx
- PropertyDetailPage.tsx  
- BookingFormPage.tsx
- BookingHistoryPage.tsx
- UserProfilePage.tsx
- Admin components (AdminDashboard, PropertyManagement, v.v.)

## Security Notes

⚠️ **QUAN TRỌNG CHO PRODUCTION:**

1. **Database credentials**: Không hardcode password trong application.properties
   - Sử dụng environment variables
   - Hoặc Spring Cloud Config

2. **CORS**: Restrict origins thay vì `*`
   ```java
   @CrossOrigin(origins = "https://yourdomain.com")
   ```

3. **Authentication**: Thêm Spring Security
   - JWT tokens
   - Role-based access control
   - Password encryption

4. **SQL Injection**: JPA đã bảo vệ, nhưng validate input kỹ hơn

5. **HTTPS**: Bật SSL cho production

## Monitoring và Logging

Spring Boot đã cấu hình logging cho:
- SQL queries (DEBUG level)
- HTTP requests
- Application errors

Kiểm tra logs trong console hoặc file logs (nếu cấu hình file logging).

## Support

Nếu gặp vấn đề:
1. Kiểm tra Spring Boot console logs
2. Kiểm tra browser console (F12)
3. Test API endpoints trực tiếp
4. Kiểm tra database connection
5. Review code trong `AGENTS.md` nếu có

## Backup và Restore

### Backup database
```sql
BACKUP DATABASE ResortRegistry 
TO DISK = 'C:\backup\ResortRegistry.bak'
WITH FORMAT;
```

### Restore database
```sql
RESTORE DATABASE ResortRegistry 
FROM DISK = 'C:\backup\ResortRegistry.bak'
WITH REPLACE;
```

---

**Chúc bạn triển khai thành công!** 🚀