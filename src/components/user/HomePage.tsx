import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Helmet } from "react-helmet-async"
import {
  View,
  Property as MockProperty,
  properties as mockProperties,
} from "../../data/mockData"
import { propertyApi, Property } from "../../utils/api"
import { transformProperties } from "../../utils/dataTransform"
import { propertySlug } from "../../utils/slug"
import Seo from "../../components/shared/Seo"

interface HomePageProps {
  navigate: (view: View, data?: unknown) => void
}

const resorts = [
  {
    name: "Đà Nẵng",
    image:
      "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=600&h=400&fit=crop&auto=format",
    count: 12,
  },
  {
    name: "Phú Quốc",
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop&auto=format",
    count: 18,
  },
  {
    name: "Nha Trang",
    image:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop&auto=format",
    count: 9,
  },
  {
    name: "Hội An",
    image:
      "https://images.unsplash.com/photo-1540541338537-b11f8a4f1e7a?w=600&h=400&fit=crop&auto=format",
    count: 7,
  },
]

const steps = [
  {
    num: "01",
    title: "Khám Phá",
    desc: "Duyệt qua hàng trăm nhà ở khu nghỉ dưỡng cao cấp trên toàn quốc với bộ lọc thông minh.",
  },
  {
    num: "02",
    title: "Đăng Ký",
    desc: "Điền form đăng ký đơn giản với thông tin cá nhân và lựa chọn thời gian cư trú.",
  },
  {
    num: "03",
    title: "Xác Nhận",
    desc: "Nhận xác nhận ngay lập tức qua email và SMS sau khi thanh toán thành công.",
  },
  {
    num: "04",
    title: "Tận Hưởng",
    desc: "Chuyển đến và tận hưởng cuộc sống resort đẳng cấp cùng các dịch vụ 5 sao.",
  },
]

const testimonials = [
  {
    name: "Nguyễn Thị Mai",
    location: "TP. Hồ Chí Minh",
    text: "ResortRegistry đã giúp chúng tôi tìm được căn biệt thự hoàn hảo ở Đà Nẵng. Quy trình đăng ký cực kỳ đơn giản và minh bạch.",
    avatar:
      "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=80&h=80&fit=crop&auto=format",
    rating: 5,
    property: "Biệt Thự Bãi Biển Azure",
  },
  {
    name: "Trần Minh Khôi",
    location: "Hà Nội",
    text: "Penthouse Phú Quốc vượt ngoài mọi kỳ vọng. Dịch vụ hỗ trợ 24/7 rất chuyên nghiệp và tận tâm.",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&auto=format",
    rating: 5,
    property: "Pearl Island Penthouse",
  },
  {
    name: "Lê Hương Giang",
    location: "Đà Nẵng",
    text: "Tôi đã ở Villa Hội An 6 tháng và đó là quyết định tuyệt vời nhất. Không khí yên bình, dịch vụ hoàn hảo.",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&auto=format",
    rating: 5,
    property: "Villa Hội An Cổ Phố",
  },
]

export default function HomePage({ navigate }: HomePageProps) {
  const routerNavigate = useNavigate()
  const [search, setSearch] = useState("")
  const [location, setLocation] = useState("")
  const [propertyType, setPropertyType] = useState("")
  const [properties, setProperties] = useState<MockProperty[]>([])
  const [loading, setLoading] = useState(true)
  const [showMockData, setShowMockData] = useState(false)

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const data = await propertyApi.getAvailableFeatured()
        const transformed = transformProperties(data)
        setProperties(transformed.length > 0 ? transformed : mockProperties)
        setShowMockData(transformed.length === 0)
      } catch (error) {
        setProperties(mockProperties)
        setShowMockData(true)
      } finally {
        setLoading(false)
      }
    }
    fetchProperties()
  }, [])

  const featuredProperties = properties.filter((p) => p.featured)

  return (
    <>
      <Seo
        title="ResortRegistry | Thuê và mua nhà nghỉ dưỡng Việt Nam"
        description="Nền tảng đăng ký và thuê/mua biệt thự, penthouse, bungalow nghỉ dưỡng cao cấp tại Việt Nam. Đà Nẵng, Phú Quốc, Nha Trang, Hội An."
        path="/"
        image="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&h=630&fit=crop&auto=format"
        type="website"
        jsonLd={[
          {
            "@type": "Organization",
            name: "ResortRegistry",
            url: "https://resortregistry.vercel.app/",
            logo: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=500&h=500&fit=crop&auto=format",
          },
          {
            "@type": "WebSite",
            name: "ResortRegistry",
            url: "https://resortregistry.vercel.app/",
          },
        ]}
      />
      <div className="min-h-screen">
        {/* Hero */}
        <section className="relative h-[92vh] min-h-[600px] flex items-center">
          <Helmet>
            <link
              rel="preload"
              as="image"
              href="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=450&fit=crop&auto=format"
              imageSrcSet="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=225&fit=crop&auto=format 400w, https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=450&fit=crop&auto=format 800w, https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&h=630&fit=crop&auto=format 1200w"
              imageSizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 1200px"
            />
          </Helmet>
          <img
            src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&h=630&fit=crop&auto=format"
            srcSet="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=225&fit=crop&auto=format 400w, https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=450&fit=crop&auto=format 800w, https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&h=630&fit=crop&auto=format 1200w, https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1920&h=1080&fit=crop&auto=format 1920w"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 1200px"
            width="1200"
            height="630"
            alt="Khu nghỉ dưỡng cao cấp ven biển với hồ bơi và tâm kiểm"
            fetchPriority="high"
            loading="eager"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-navy/80 via-navy/70 to-navy/90" />

          <div className="relative max-w-7xl mx-auto px-6 w-full">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-gold/20 border border-gold/30 rounded-full px-4 py-1.5 mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
                <span className="text-gold text-xs font-semibold tracking-widest uppercase">
                  Khu Nghỉ Dưỡng Cao Cấp
                </span>
              </div>

              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl text-cream font-semibold leading-tight mb-6">
                Sống Đẳng Cấp Tại
                <br />
                <span className="text-gold italic">Resort Mơ Ước</span>
                <br />
                Của Bạn
              </h1>

              <p className="text-cream/70 text-lg mb-10 max-w-lg">
                Khám phá và đăng ký nhà ở tại các khu nghỉ dưỡng 5 sao trên khắp
                Việt Nam. Quy trình đơn giản, minh bạch, an toàn.
              </p>

              {/* Search bar */}
              <div className="bg-cream rounded-xl p-2 flex flex-col sm:flex-row gap-2 shadow-2xl">
                <input
                  type="text"
                  placeholder="Tìm kiếm tên khu nghỉ dưỡng, villa..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  aria-label="Tìm kiếm khu nghỉ dưỡng"
                  className="flex-1 px-4 py-3 text-navy placeholder-muted bg-transparent text-sm rounded-lg focus:ring-0 border-0"
                />
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="px-4 py-3 text-navy text-sm bg-cream-dark rounded-lg border-0 cursor-pointer"
                >
                  <option value="">Tất cả địa điểm</option>
                  <option>Đà Nẵng</option>
                  <option>Phú Quốc</option>
                  <option>Nha Trang</option>
                  <option>Hội An</option>
                  <option>Mũi Né</option>
                </select>
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="px-4 py-3 text-navy text-sm bg-cream-dark rounded-lg border-0 cursor-pointer"
                >
                  <option value="">Loại nhà</option>
                  <option>Villa</option>
                  <option>Penthouse</option>
                  <option>Bungalow</option>
                </select>
                <button
                  onClick={() => routerNavigate("/danh-sach-nha")}
                  className="bg-navy text-gold font-semibold px-6 py-3 rounded-lg hover:bg-navy-light transition-colors text-sm whitespace-nowrap"
                >
                  Tìm Kiếm
                </button>
              </div>

              <div className="flex flex-wrap gap-4 mt-4">
                {["Hồ Bơi Riêng", "Mặt Biển", "Penthouse", "Eco Villa"].map(
                  (tag) => (
                    <button
                      key={tag}
                      onClick={() => routerNavigate("/danh-sach-nha")}
                      className="text-xs text-cream/60 hover:text-gold border border-cream/20 hover:border-gold/40 rounded-full px-3 py-1 transition-all"
                    >
                      {tag}
                    </button>
                  ),
                )}
              </div>
            </div>
          </div>

          {/* Stats floating bar */}
          <div className="absolute bottom-0 left-0 right-0">
            <div className="max-w-7xl mx-auto px-6">
              <div className="bg-navy-light/90 backdrop-blur border border-navy-lighter rounded-t-2xl px-8 py-5 grid grid-cols-2 sm:grid-cols-4 gap-6">
                {[
                  { val: "48+", label: "Căn Nhà Cao Cấp" },
                  { val: "8", label: "Khu Nghỉ Dưỡng" },
                  { val: "1,200+", label: "Khách Hàng Hài Lòng" },
                  { val: "98%", label: "Tỷ Lệ Hài Lòng" },
                ].map((s) => (
                  <div key={s.label} className="text-center">
                    <p className="font-display text-2xl text-gold font-semibold">
                      {s.val}
                    </p>
                    <p className="text-xs text-cream/60 mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Featured Resorts */}
        <section className="py-20 bg-cream">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-gold text-xs font-semibold tracking-widest uppercase mb-2">
                  Điểm Đến Nổi Bật
                </p>
                <h2 className="font-display text-3xl sm:text-4xl text-navy font-semibold">
                  Khu Nghỉ Dưỡng
                  <br />
                  Được Ưa Chuộng
                </h2>
              </div>
              <button
                onClick={() => routerNavigate("/danh-sach-nha")}
                className="hidden sm:flex items-center gap-2 text-sm text-teal hover:text-navy transition-colors font-semibold"
              >
                Xem Tất Cả
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {resorts.map((resort, i) => (
                <button
                  key={resort.name}
                  onClick={() => routerNavigate("/danh-sach-nha")}
                  className={`relative overflow-hidden rounded-2xl group ${
                    i === 0
                      ? "col-span-2 row-span-2 min-h-[320px]"
                      : "min-h-[150px]"
                  }`}
                >
                  <img
                    src={resort.image}
                    srcSet={`${resort.image}&w=400 400w, ${resort.image}&w=800 800w`}
                    sizes="(max-width: 768px) 50vw, 25vw"
                    width="400"
                    height="225"
                    alt={resort.name}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-navy/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-4">
                    <p className="font-display text-cream font-semibold text-lg">
                      {resort.name}
                    </p>
                    <p className="text-cream/70 text-xs mt-0.5">
                      {resort.count} căn khả dụng
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Properties */}
        <section className="py-20 bg-cream-dark">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-12">
              <p className="text-gold text-xs font-semibold tracking-widest uppercase mb-2">
                Được Đề Xuất
              </p>
              <h2 className="font-display text-3xl sm:text-4xl text-navy font-semibold">
                Nhà Ở Đặc Sắc
              </h2>
              {showMockData && (
                <p className="text-xs text-teal mb-2">
                  Đang hiển thị dữ liệu mẫu
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredProperties.map((property) => (
                <div
                  key={property.id}
                  className="bg-cream rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group cursor-pointer"
                  onClick={() =>
                    routerNavigate(
                      `/nha/${propertySlug(property.name, property.id)}`,
                    )
                  }
                >
                  <div className="relative h-56 overflow-hidden bg-navy/10">
                    <img
                      src={property.images[0]}
                      alt={property.name}
                      width="400"
                      height="225"
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute top-3 left-3">
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                          property.status === "available"
                            ? "bg-success text-cream"
                            : "bg-warning text-cream"
                        }`}
                      >
                        {property.status === "available"
                          ? "Còn Trống"
                          : "Đã Đặt"}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3 bg-cream/90 backdrop-blur rounded-full px-2.5 py-1 flex items-center gap-1">
                      <span className="text-gold text-xs">★</span>
                      <span className="text-navy text-xs font-semibold">
                        {property.rating}
                      </span>
                    </div>
                  </div>

                  <div className="p-5">
                    <p className="text-muted text-xs mb-1">
                      {property.resort} · {property.province}
                    </p>
                    <h3 className="font-display text-navy text-lg font-semibold mb-2 group-hover:text-teal transition-colors">
                      {property.name}
                    </h3>
                    <p className="text-muted text-sm line-clamp-2 mb-4">
                      {property.description}
                    </p>

                    <div className="flex items-center gap-3 text-xs text-muted mb-4">
                      <span className="flex items-center gap-1">
                        <span>🛏</span> {property.bedrooms} PN
                      </span>
                      <span className="flex items-center gap-1">
                        <span>🚿</span> {property.bathrooms} WC
                      </span>
                      <span className="flex items-center gap-1">
                        <span>📐</span> {property.area} m²
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        {property.transactionType === "buy" ? (
                          <>
                            <span className="font-display text-xl text-navy font-semibold">
                              {property.price >= 1000
                                ? (property.price / 1000).toLocaleString(
                                    "vi-VN",
                                  )
                                : property.price}
                            </span>
                            <span className="text-muted text-xs ml-1">
                              {property.price >= 1000 ? "tỷ VNĐ" : "triệu VNĐ"}{" "}
                              · Bán
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="font-display text-xl text-navy font-semibold">
                              {property.price}
                            </span>
                            <span className="text-muted text-xs ml-1">
                              triệu VNĐ/tháng
                            </span>
                          </>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          routerNavigate(
                            `/nha/${propertySlug(property.name, property.id)}`,
                          )
                        }}
                        className="text-xs font-semibold text-teal hover:text-navy border border-teal/30 hover:border-navy/30 px-4 py-2 rounded-lg transition-all"
                      >
                        Xem Chi Tiết
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-10">
              <button
                onClick={() => routerNavigate("/danh-sach-nha")}
                className="bg-navy text-gold font-semibold px-8 py-3 rounded-xl hover:bg-navy-light transition-colors"
              >
                Xem Tất Cả Nhà Ở
              </button>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-20 bg-navy">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-14">
              <p className="text-gold text-xs font-semibold tracking-widest uppercase mb-2">
                Quy Trình
              </p>
              <h2 className="font-display text-3xl sm:text-4xl text-cream font-semibold">
                Đơn Giản Chỉ 4 Bước
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {steps.map((step, i) => (
                <div key={step.num} className="text-center group">
                  <div className="relative inline-flex mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-navy-lighter border border-gold/20 flex items-center justify-center group-hover:border-gold/60 transition-colors">
                      <span className="font-display text-gold text-2xl font-semibold">
                        {step.num}
                      </span>
                    </div>
                    {i < steps.length - 1 && (
                      <div className="hidden lg:block absolute top-1/2 left-full w-full h-px bg-gradient-to-r from-gold/30 to-transparent -translate-y-1/2 ml-2" />
                    )}
                  </div>
                  <h3 className="font-display text-cream text-lg font-semibold mb-2">
                    {step.title}
                  </h3>
                  <p className="text-cream/50 text-sm leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 bg-cream">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-12">
              <p className="text-gold text-xs font-semibold tracking-widest uppercase mb-2">
                Khách Hàng Nói Gì
              </p>
              <h2 className="font-display text-3xl sm:text-4xl text-navy font-semibold">
                Đánh Giá Thực Tế
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((t) => (
                <div
                  key={t.name}
                  className="bg-cream-dark rounded-2xl p-6 border border-cream-dark hover:border-gold/20 transition-colors"
                >
                  <div className="flex gap-1 mb-4">
                    {Array(t.rating)
                      .fill(0)
                      .map((_, i) => (
                        <span key={i} className="text-gold">
                          ★
                        </span>
                      ))}
                  </div>
                  <p className="text-navy/80 text-sm leading-relaxed mb-5 italic">
                    "{t.text}"
                  </p>
                  <div className="flex items-center gap-3">
                    <img
                      src={t.avatar}
                      alt={t.name}
                      className="w-10 h-10 rounded-full object-cover border-2 border-gold/30"
                    />
                    <div>
                      <p className="text-navy font-semibold text-sm">
                        {t.name}
                      </p>
                      <p className="text-muted text-xs">
                        {t.location} · {t.property}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="py-20 bg-navy relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "radial-gradient(circle at 70% 50%, #C9A96E 0%, transparent 60%)",
            }}
          />
          <div className="max-w-3xl mx-auto px-6 text-center relative">
            <h2 className="font-display text-3xl sm:text-4xl text-cream font-semibold mb-4">
              Sẵn Sàng Khám Phá
              <br />
              <span className="text-gold italic">Cuộc Sống Resort?</span>
            </h2>
            <p className="text-cream/60 mb-8">
              Đăng ký miễn phí và nhận tư vấn từ đội ngũ chuyên gia của chúng
              tôi ngay hôm nay.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => routerNavigate("/dang-nhap")}
                className="bg-gold text-navy font-semibold px-8 py-3 rounded-xl hover:bg-gold-light transition-colors"
              >
                Tạo Tài Khoản Miễn Phí
              </button>
              <button
                onClick={() =>
                  routerNavigate("/mua-ban-bat-dong-san-nghi-duong")
                }
                className="border border-cream/30 text-cream font-semibold px-8 py-3 rounded-xl hover:border-gold/50 hover:text-gold transition-colors"
              >
                Danh Sách Nhà
              </button>
              <button
                onClick={() => routerNavigate("/thue-biet-thu-nghi-duong")}
                className="border border-cream/30 text-cream font-semibold px-8 py-3 rounded-xl hover:border-gold/50 hover:text-gold transition-colors"
              >
                Khu Nghỉ Dưỡng
              </button>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
