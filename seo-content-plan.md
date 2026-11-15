# Hướng dẫn bài tập SEO — Nghiên cứu từ khóa & Kế hoạch nội dung cho ResortRegistry

> Áp dụng cho website trong thư mục `Ck` (ResortRegistry — nền tảng thuê/mua nhà nghỉ dưỡng).
> ⚠️ Các số Volume / SD trong bảng dưới là **số liệu minh họa**. Khi làm bài, bạn thay bằng số thật lấy từ Ubersuggest / Google Keyword Planner theo hướng dẫn ở mục 3.

---

## 1. Phân tích website ResortRegistry

**Chủ đề:** Nền tảng trực tuyến tìm kiếm, đặt thuê và mua nhà ở khu nghỉ dưỡng tại Việt Nam (biệt thự/villa, bungalow, penthouse, căn hộ resort).

**Chức năng hiện có (đọc từ mã nguồn):**
- Trang chủ (`HomePage`), Danh sách nhà có bộ lọc (`ListingsPage`), Chi tiết từng nhà (`PropertyDetailPage`)
- Đặt phòng → Xác nhận → Thanh toán (`BookingFormPage`, `BookingConfirmPage`, `PaymentPage`)
- Tài khoản: Đăng nhập, quên mật khẩu, hồ sơ, lịch sử đặt phòng
- Chat trực tiếp với nhân viên (WebSocket `ChatWidget`), trang Admin (quản lý nhà, người dùng, đặt phòng, lịch hẹn, phí, cài đặt)

**Điểm yếu SEO hiện tại (nói trong báo cáo để được điểm cộng):**
- Website điều hướng bằng state trong `App.tsx` (switch-case) nên **không có URL riêng cho từng trang** → nên bổ sung `react-router` để mỗi trang có URL thật (`/listings`, `/property/:id`, `/blog/:slug`...), kèm `sitemap.xml` và thẻ `title`/`meta description` theo từ khóa mục tiêu.
- Chưa có **Blog** → đây chính là chỗ cho kế hoạch nội dung (Bảng 2.3): nhóm bài informational để đón traffic và dẫn về trang đặt phòng.

## 2. Bước 1 — Chủ đề & đối tượng người dùng mục tiêu

| Đối tượng | Nhu cầu | Ý định tìm kiếm chiếm đa số |
|---|---|---|
| Khách du lịch (gia đình, nhóm bạn, cặp đôi) | Thuê biệt thự/bungalow nghỉ dưỡng 2–7 ngày | Transactional |
| Nhà đầu tư BĐS nghỉ dưỡng | Mua villa, penthouse để kinh doanh/ở | Transactional |
| Người mới tìm hiểu du lịch nghỉ dưỡng | Hỏi "là gì", "nên đi đâu", "kinh nghiệm đặt phòng" | Informational |
| Khách hàng hiện hữu | Vào thẳng trang đăng nhập, lịch sử đặt phòng | Navigational |

## 3. Bước 2 — Nghiên cứu từ khóa bằng công cụ miễn phí

### 3.1. Google Keyword Planner (ads.google.com)
1. Tạo tài khoản Google Ads (miễn phí, chưa cần chạy quảng cáo) → Menu **Công cụ → Lập kế hoạch → Trình lập kế hoạch từ khóa**.
2. Chọn **"Khám phá từ khóa mới"**, nhập cụm hạt giống: `resort`, `đặt phòng resort`, `biệt thự nghỉ dưỡng`, `thuê villa`.
3. Đặt **Vị trí = Việt Nam**, Ngôn ngữ = Tiếng Việt → Lấy 2 cột: **Lượng tìm kiếm trung bình/tháng** và **Mức cạnh tranh** (Thấp/Trung bình/Cao).
4. Lưu ý: "Mức cạnh tranh" của Keyword Planner là cạnh tranh **quảng cáo**, không phải SEO Difficulty — chỉ dùng để tham khảo; số SD 0–100 lấy từ Ubersuggest (mục 3.3).

### 3.2. Google Trends (trends.google.com — miễn phí, không cần tài khoản)
1. Nhập từ khóa, chọn **Vùng = Việt Nam**, khung thời gian 12 tháng hoặc 5 năm.
2. So sánh nhiều từ khóa (`resort` vs `khách sạn` vs `biệt thự nghỉ dưỡng`) để chọn "từ chính" cho từng nhóm.
3. Xem **mùa vụ**: resort cao điểm hè (6–8) và Tết → lên lịch đăng bài trước cao điểm 1–2 tháng.
4. Mục **Truy vấn liên quan → "Đang tăng vọt" (Breakout)** = nguồn từ khóa mới, ít cạnh tranh.

### 3.3. Ubersuggest (neilpatel.com/vi/ubersuggest/ — miễn phí 3 lượt tìm/ngày)
1. Nhập từ khóa → ghi lại: **Volume**, **SEO Difficulty (SD 0–100)**, CPC.
   - SD 0–35 = Thấp · 36–69 = Trung bình · ≥70 = Cao (đúng thang bảng 2.1 yêu cầu).
2. Tab **Ý tưởng từ khóa (Keyword Ideas)** → mở rộng danh sách từ liên quan, "cùng chứa từ", "câu hỏi".
3. Tab **Ý tưởng nội dung (Content Ideas)** → xem bài viết cùng chủ đề đang viral để lấy ý tưởng tiêu đề.
4. Mẹo: 3 lượt/ngày → mỗi ngày research 3 từ hạt giống chính, kéo ý tưởng phụ miễn phí bên trong kết quả.

### 3.4. AnswerThePublic (answerthepublic.com — miễn phí vài lượt/ngày)
1. Nhập `resort` hoặc `biệt thự nghỉ dưỡng`, chọn ngôn ngữ Tiếng Việt.
2. Công cụ xuất các câu hỏi thực tế người dùng gõ: **là gì / ai / khi nào / ở đâu / có nên / cách nào** → đây chính là kho từ khóa **informational** cho Blog.
3. Bấm Export CSV để dồn vào bảng.

### 3.5. Công cụ miễn phí bổ sung (không cần tài khoản)
- **Google Autocomplete:** gõ `resort đà`, `thuê biệt thự` vào ô tìm kiếm Google, chép các gợi ý.
- **"Mọi người cũng hỏi" (People Also Ask)** và **"Tìm kiếm liên quan"** (cuối trang kết quả Google) → câu hỏi informational.
- **Tiện ích Keyword Surfer** (Chrome): hiện volume ngay trên trang kết quả tìm kiếm.

### 3.6. Quy trình tổng hợp (làm 1 buổi là xong)
1. Đổ "từ hạt giống" vào Autocomplete + AnswerThePublic → gom ~30–50 từ thô.
2. Lọc trùng, bỏ từ ngoài chủ đề → còn ~15–20 từ.
3. Ubersuggest + Keyword Planner → điền Volume, SD cho từng từ (chia ngày để đỡ tốn lượt).
4. Google Trends → kiểm tra xu hướng tăng/giảm, mùa vụ.
5. Gắn nhãn ý định tìm kiếm + nhóm chủ đề → điền vào **Bảng 2.1**.

## 4. Bước 3 — Phân loại ý định tìm kiếm (Search Intent)

| Ý định | Dấu hiệu nhận biết trong từ khóa | Trang đích phù hợp |
|---|---|---|
| **Informational** (Thông tin) | là gì, cách, kinh nghiệm, nên, top, review, so sánh | Blog, FAQ |
| **Navigational** (Điều hướng) | tên thương hiệu, đăng nhập, tải app | Trang chủ, /login |
| **Transactional** (Giao dịch) | đặt, thuê, mua, booking, giá, khuyến mãi | /listings, trang chi tiết, /booking |

## 5. Bảng 2.1 — Nghiên cứu từ khóa (mẫu đã điền — thay số thật từ tool)

| Từ khóa | Volume tìm kiếm/tháng | Độ cạnh tranh (SD) | Ý định tìm kiếm | Nhóm chủ đề | Trang/bài viết dự kiến |
|---|---|---|---|---|---|
| đặt phòng resort | 6.600 | 42 (Trung bình) | Transactional | Đặt phòng | /listings |
| thuê biệt thự nghỉ dưỡng | 1.300 | 28 (Thấp) | Transactional | Danh mục nhà | /listings?type=villa |
| resort Đà Nẵng giá tốt | 3.600 | 40 (Trung bình) | Transactional | Địa điểm | /listings?location=da-nang |
| villa Phú Quốc view biển | 880 | 33 (Thấp) | Transactional | Địa điểm | /listings?location=phu-quoc |
| mua biệt thự nghỉ dưỡng | 590 | 38 (Trung bình) | Transactional | Mua bán | /listings?deal=buy |
| thuê bungalow biển | 260 | 18 (Thấp) | Transactional | Danh mục nhà | /listings?type=bungalow |
| biệt thự nghỉ dưỡng là gì | 320 | 10 (Thấp) | Informational | Kiến thức | /blog/biet-thu-nghi-duong-la-gi |
| kinh nghiệm đặt phòng resort | 480 | 15 (Thấp) | Informational | Kinh nghiệm | /blog/kinh-nghiem-dat-phong-resort |
| nên đi resort nào ở Việt Nam | 720 | 21 (Thấp) | Informational | Địa điểm | /blog/resort-dep-nhat-viet-nam |
| thuê hay mua biệt thự nghỉ dưỡng | 90 | 8 (Thấp) | Informational | Kiến thức | /blog/thue-hay-mua-biet-thu |
| đầu tư bất động sản nghỉ dưỡng | 1.000 | 45 (Trung bình) | Informational | Đầu tư | /blog/dau-tu-bds-nghi-duong |
| ResortRegistry | 140 | 4 (Thấp) | Navigational | Thương hiệu | / (trang chủ) |
| đăng nhập ResortRegistry | 40 | 3 (Thấp) | Navigational | Thương hiệu | /login |

## 6. Bước 4 — Sơ đồ cấu trúc website (Site Structure)

```
Trang chủ (/) — "nền tảng đặt phòng resort"
│
├── NHÀ NGHỈ DƯỠNG (/listings) — "đặt phòng resort"
│   ├── Theo loại: Biệt thự · Bungalow · Penthouse · Căn hộ
│   ├── Theo địa điểm: Đà Nẵng · Phú Quốc · Hội An · Nha Trang
│   └── Theo nhu cầu: Thuê ngắn hạn · Mua (mua biệt thự nghỉ dưỡng)
│
├── CHI TIẾT NHÀ (/property/:id) — "villa Hội An view biển" + nút Đặt phòng
│
├── ĐẶT PHÒNG (/booking) → Xác nhận (/booking-confirm) → Thanh toán (/payment)
│
├── BLOG (/blog) — đón traffic informational
│   ├── Kiến thức: biệt thự nghỉ dưỡng là gì · thuê hay mua
│   ├── Kinh nghiệm: đặt phòng resort giá rẻ · thời điểm đẹp
│   ├── Địa điểm: top resort Đà Nẵng/Phú Quốc · review từng property
│   └── Đầu tư: đầu tư BĐS nghỉ dưỡng 2026
│
├── TÀI KHOẢN — Đăng nhập (/login) · Lịch sử đặt phòng (/history)
│
└── HỖ TRỢ — Chat trực tuyến · Câu hỏi thường gặp (FAQ)
```

### Bảng 2.2 — Cấu trúc nội dung website (mẫu đã điền)

| Danh mục chính | Danh mục con | Từ khóa mục tiêu | URL dự kiến |
|---|---|---|---|
| Trang chủ | — | nền tảng đặt phòng resort hàng đầu | / |
| Nhà nghỉ dưỡng | Biệt thự (villa) | thuê biệt thự nghỉ dưỡng | /listings?type=villa |
| Nhà nghỉ dưỡng | Bungalow | thuê bungalow biển | /listings?type=bungalow |
| Nhà nghỉ dưỡng | Penthouse | penthouse view biển cho thuê | /listings?type=penthouse |
| Nhà nghỉ dưỡng | Căn hộ resort | căn hộ nghỉ dưỡng cho thuê | /listings?type=apartment |
| Mua bán | BĐS nghỉ dưỡng | mua biệt thự nghỉ dưỡng | /listings?deal=buy |
| Địa điểm | Đà Nẵng · Phú Quốc · Hội An | resort Đà Nẵng giá tốt | /listings?location=da-nang |
| Đặt phòng | Quy trình đặt & thanh toán | đặt phòng resort online | /booking |
| Blog | Kiến thức · Kinh nghiệm · Địa điểm · Đầu tư | biệt thự nghỉ dưỡng là gì | /blog |
| Tài khoản | Đăng nhập · Lịch sử đặt phòng | đăng nhập ResortRegistry | /login |

## 7. Bước 5 — Bảng 2.3 — Kế hoạch nội dung (mẫu đã điền)

| STT | Tiêu đề bài viết | Từ khóa mục tiêu | Loại nội dung | Chuyên mục | Trạng thái |
|---|---|---|---|---|---|
| 1 | Biệt thự nghỉ dưỡng là gì? Phân biệt villa – bungalow – penthouse | biệt thự nghỉ dưỡng là gì | Informational (blog) | Kiến thức | Đã đăng |
| 2 | Top 10 resort & biệt thự đẹp nhất Việt Nam 2026 | nên đi resort nào ở Việt Nam | Informational (listicle) | Địa điểm | Đang viết |
| 3 | Kinh nghiệm đặt phòng resort online giá rẻ, tránh "đón gạch" | kinh nghiệm đặt phòng resort | Informational (how-to) | Kinh nghiệm | Chưa bắt đầu |
| 4 | Thuê hay mua biệt thự nghỉ dưỡng: phân tích chi phí & lợi nhuận | thuê hay mua biệt thự nghỉ dưỡng | Informational (so sánh) | Kiến thức | Chưa bắt đầu |
| 5 | Đầu tư BĐS nghỉ dưỡng Phú Quốc: tiềm năng và rủi ro 2026 | đầu tư bất động sản nghỉ dưỡng | Informational (phân tích) | Đầu tư | Chưa bắt đầu |
| 6 | Trang danh sách biệt thự nghỉ dưỡng (landing page) | thuê biệt thự nghỉ dưỡng | Transactional (trang dịch vụ) | Danh mục | Đã đăng |
| 7 | Trang chi tiết: Villa Hội An Cổ Phố — không gian, giá, trải nghiệm | villa Hội An view biển | Transactional (trang sản phẩm) | Sản phẩm | Đã đăng |
| 8 | Hướng dẫn đặt phòng & thanh toán online tại ResortRegistry | đặt phòng resort online | Transactional (hướng dẫn) | Hỗ trợ | Đang viết |
| 9 | Bungalow biển là gì? 5 mẫu bungalow đang được ưa chuộng | thuê bungalow biển | Informational (blog) | Kiến thức | Chưa bắt đầu |
| 10 | Câu hỏi thường gặp về đặt phòng & thanh toán | câu hỏi đặt phòng resort | Informational (FAQ) | Hỗ trợ | Chưa bắt đầu |

> Gợi ý trình tự đăng: các bài informational (1→5) đăng trước cao điểm du lịch (hè/Tết), các trang transactional (6→8) là "xương sống" phải có ngay từ đầu vì website đã xây sẵn.

## 8. Checklist nộp bài

- [ ] Mô tả chủ đề + 3–4 nhóm đối tượng người dùng (mục 2)
- [ ] Ảnh chụp màn hình từng công cụ (Keyword Planner, Trends, Ubersuggest, AnswerThePublic) làm bằng chứng research
- [ ] Bảng 2.1 ≥ 10 từ khóa, đủ cả 3 loại ý định, số liệu thật từ tool
- [ ] Sơ đồ cấu trúc website vẽ bằng draw.io / diagrams.net (chèn vào báo cáo)
- [ ] Bảng 2.2 ≥ 8 dòng, URL khớp với sơ đồ
- [ ] Bảng 2.3 ≥ 8 bài viết, mỗi bài gắn đúng từ khóa của Bảng 2.1/2.2
