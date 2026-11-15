import React, { Suspense, useEffect, useRef, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { View, Property, adminUser, User as MockUser } from "./data/mockData"
import { properties as mockProperties } from "./data/mockData"
import { blogPosts } from "./data/blogPosts"
import { propertySlug } from "./utils/slug"
import { User as ApiUser, userApi } from "./utils/api"
import { transformUser } from "./utils/dataTransform"
import Navbar from "./components/shared/Navbar"
import Footer from "./components/shared/Footer"
import NotFoundPage from "./components/shared/NotFoundPage"
import Seo from "./components/shared/Seo"
import HomePage from "./components/user/HomePage"
import ListingsPage from "./components/user/ListingsPage"

const AdminLayout = React.lazy(() => import("./components/admin/AdminLayout"))
const AdminDashboard = React.lazy(
  () => import("./components/admin/AdminDashboard"),
)
const PropertyManagement = React.lazy(
  () => import("./components/admin/PropertyManagement"),
)
const UserManagement = React.lazy(
  () => import("./components/admin/UserManagement"),
)
const BookingManagement = React.lazy(
  () => import("./components/admin/BookingManagement"),
)
const AppointmentManagement = React.lazy(
  () => import("./components/admin/AppointmentManagement"),
)
const FeeManagement = React.lazy(
  () => import("./components/admin/FeeManagement"),
)
const SystemSettings = React.lazy(
  () => import("./components/admin/SystemSettings"),
)
const AdminChatPage = React.lazy(
  () => import("./components/admin/AdminChatPage"),
)
const ChatWidget = React.lazy(() => import("./components/chat/ChatWidget"))
const PropertyDetailPage = React.lazy(
  () => import("./components/user/PropertyDetailPage"),
)
const BookingFormPage = React.lazy(
  () => import("./components/user/BookingFormPage"),
)
const BookingConfirmPage = React.lazy(
  () => import("./components/user/BookingConfirmPage"),
)
const PaymentPage = React.lazy(() => import("./components/user/PaymentPage"))
const UserProfilePage = React.lazy(
  () => import("./components/user/UserProfilePage"),
)
const BookingHistoryPage = React.lazy(
  () => import("./components/user/BookingHistoryPage"),
)
const LoginPage = React.lazy(() => import("./components/user/LoginPage"))
const ForgotPasswordPage = React.lazy(
  () => import("./components/user/ForgotPasswordPage"),
)
const BlogListPage = React.lazy(() => import("./components/blog/BlogListPage"))
const BlogDetailPage = React.lazy(
  () => import("./components/blog/BlogDetailPage"),
)

const Loading = () => (
  <div className="p-4 text-center text-navy">Đang tải...</div>
)

const SESSION_KEY = "rr_user"
const TOKEN_KEY = "rr_token"

const VIEW_TO_URL: Record<View, string> = {
  home: "/",
  listings: "/danh-sach-nha",
  "property-detail": "/nha/placeholder",
  "booking-form": "/booking-form",
  "booking-confirm": "/booking-confirm",
  payment: "/payment",
  "payment-success": "/payment-success",
  profile: "/profile",
  history: "/history",
  "admin-dashboard": "/admin-dashboard",
  "admin-properties": "/admin-properties",
  "admin-users": "/admin-users",
  "admin-bookings": "/admin-bookings",
  "admin-appointments": "/admin-appointments",
  "admin-fees": "/admin-fees",
  "admin-settings": "/admin-settings",
  "admin-chat": "/admin-chat",
  login: "/dang-nhap",
  "forgot-password": "/quen-mat-khau",
}

const isPublicPath = (path: string) =>
  path === "/" ||
  path === "/danh-sach-nha" ||
  path === "/thue-biet-thu-nghi-duong" ||
  path === "/thue-bungalow-bien" ||
  path === "/mua-ban-bat-dong-san-nghi-duong" ||
  path.startsWith("/nha/") ||
  path === "/blog" ||
  path.startsWith("/blog/") ||
  path === "/dang-nhap" ||
  path === "/quen-mat-khau"

interface NavData {
  property?: Property
  bookingParams?: {
    months: number
    startDate: string
    endDate?: string
    processingFee: number
    deposit: number
    total: number
  }
  form?: {
    fullName: string
    email: string
    phone: string
    cmnd: string
    address: string
    occupation: string
    income: string
    paymentMethod: string
    notes: string
    agreeTerms: boolean
    agreePolicy: boolean
  }
}

export default function App() {
  const [view, setView] = useState<View>("home")
  const [isAdmin, setIsAdmin] = useState(false)
  const [currentUser, setCurrentUser] = useState<MockUser | null>(null)
  const [currentUserApi, setCurrentUserApi] = useState<ApiUser | null>(null)
  const [navData, setNavData] = useState<NavData>({})
  const viewStackRef = useRef<View[]>([])
  const location = useLocation()
  const routerNavigate = useNavigate()

  // Khi URL thay đổi (Back/Forward hoặc navigate), đồng bộ sang view cho trang công khai
  useEffect(() => {
    const path = location.pathname
    if (path === "/") {
      setView("home")
      return
    }
    if (
      path === "/danh-sach-nha" ||
      path === "/thue-biet-thu-nghi-duong" ||
      path === "/thue-bungalow-bien" ||
      path === "/mua-ban-bat-dong-san-nghi-duong"
    ) {
      setView("listings")
      return
    }
    if (path.startsWith("/nha/")) {
      setView("property-detail")
      return
    }
    if (path === "/dang-nhap") {
      setView("login")
      return
    }
    if (path === "/quen-mat-khau") {
      setView("forgot-password")
      return
    }
  }, [location])

  const applyUser = (apiUser: ApiUser) => {
    setCurrentUserApi(apiUser)
    setCurrentUser(transformUser(apiUser))
    setIsAdmin(apiUser.role === "ADMIN")
  }

  useEffect(() => {
    const stored = localStorage.getItem(SESSION_KEY)
    const token = localStorage.getItem(TOKEN_KEY)
    if (!stored || !token) {
      localStorage.removeItem(SESSION_KEY)
      localStorage.removeItem(TOKEN_KEY)
      return
    }
    try {
      const apiUser: ApiUser = JSON.parse(stored)
      applyUser(apiUser)
      userApi
        .getById(apiUser.id)
        .then(applyUser)
        .catch(() => {})
    } catch {
      localStorage.removeItem(SESSION_KEY)
      localStorage.removeItem(TOKEN_KEY)
    }
  }, [])

  const handleNavigate = (newView: View, data?: unknown, options?: { replace?: boolean }) => {
    if (data) {
      if (newView === "property-detail") {
        const d = data as { property?: Property }
        if (d.property)
          setNavData((prev) => ({ ...prev, property: d.property }))
      } else if (newView === "booking-form") {
        const d = data as {
          property?: Property
          months?: number
          startDate?: string
          processingFee?: number
          deposit?: number
          total?: number
        }
        if (d.property)
          setNavData((prev) => ({ ...prev, property: d.property }))
        if (d.months !== undefined)
          setNavData((prev) => ({
            ...prev,
            bookingParams: {
              months: d.months!,
              startDate: d.startDate || "",
              processingFee: d.processingFee!,
              deposit: d.deposit!,
              total: d.total!,
            },
          }))
      } else if (newView === "booking-confirm") {
        const d = data as {
          property?: Property
          bookingParams?: NavData["bookingParams"]
          form?: NavData["form"]
        }
        setNavData((prev) => ({
          property: d.property || prev.property,
          bookingParams: d.bookingParams || prev.bookingParams,
          form: d.form || prev.form,
        }))
      } else if (newView === "payment") {
        const d = data as {
          property?: Property
          bookingParams?: NavData["bookingParams"]
          form?: NavData["form"]
        }
        setNavData((prev) => ({
          property: d.property || prev.property,
          bookingParams: d.bookingParams || prev.bookingParams,
          form: d.form || prev.form,
        }))
      }
    }
    viewStackRef.current.push(view)
    let url: string
    if (newView === "property-detail" && navData.property) {
      url = `/nha/${propertySlug(navData.property.name, navData.property.id)}`
    } else {
      url = VIEW_TO_URL[newView]
    }
    // Dùng navigate của React Router để location cập nhật ngay
    // (window.history.pushState gọi tay KHÔNG được React Router v7 đồng bộ)
    routerNavigate(url, { state: { view: newView }, replace: options?.replace })
    setView(newView)
    window.scrollTo(0, 0)
  }

  const handleLogin = (user: ApiUser, token: string) => {
    applyUser(user)
    localStorage.setItem(SESSION_KEY, JSON.stringify(user))
    localStorage.setItem(TOKEN_KEY, token)
    // Điều hướng do LoginPage tự gọi navigate sau onLogin — không navigate trùng ở đây
  }

  const handleProfileSaved = (user: ApiUser) => {
    applyUser(user)
    localStorage.setItem(SESSION_KEY, JSON.stringify(user))
    handleNavigate("profile")
  }

  const handleLogout = () => {
    setIsAdmin(false)
    setCurrentUser(null)
    setCurrentUserApi(null)
    localStorage.removeItem(SESSION_KEY)
    localStorage.removeItem(TOKEN_KEY)
    viewStackRef.current = []
    routerNavigate("/", { replace: true })
    setView("home")
  }

  // Trang công khai render trực tiếp theo URL
  const publicPage = () => {
    const path = location.pathname
    if (path === "/") return <HomePage navigate={handleNavigate} />
    if (path === "/danh-sach-nha")
      return <ListingsPage navigate={handleNavigate} />
    if (path === "/thue-biet-thu-nghi-duong")
      return (
        <ListingsPage
          navigate={handleNavigate}
          initialFilter={{ type: "villa" }}
        />
      )
    if (path === "/thue-bungalow-bien")
      return (
        <ListingsPage
          navigate={handleNavigate}
          initialFilter={{ type: "bungalow" }}
        />
      )
    if (path === "/mua-ban-bat-dong-san-nghi-duong")
      return (
        <ListingsPage
          navigate={handleNavigate}
          initialFilter={{ deal: "buy" }}
        />
      )
    if (path.startsWith("/nha/")) {
      const slug = path.slice("/nha/".length)
      const property = mockProperties.find(
        (p) => propertySlug(p.name, p.id) === slug,
      )
      if (!property) return <NotFoundPage />
      return (
        <PropertyDetailPage
          property={property}
          navigate={handleNavigate}
          currentUser={currentUser}
        />
      )
    }
    if (path === "/dang-nhap")
      return (
        <>
          <Seo
            title="Đăng nhập - ResortRegistry"
            description="Đăng nhập tài khoản ResortRegistry để quản lý đặt chỗ, hồ sơ và lịch sử thuê nhà."
            path="/dang-nhap"
            noindex
          />
          <LoginPage navigate={handleNavigate} onLogin={handleLogin} />
        </>
      )
    if (path === "/quen-mat-khau")
      return (
        <>
          <Seo
            title="Quên mật khẩu - ResortRegistry"
            description="Quên mật khẩu ResortRegistry. Nhập email để nhận hướng dẫn đặt lại mật khẩu."
            path="/quen-mat-khau"
            noindex
          />
          <ForgotPasswordPage navigate={handleNavigate} />
        </>
      )
    if (path === "/blog") return <BlogListPage />
    if (path.startsWith("/blog/")) {
      const slug = path.slice("/blog/".length)
      const post = blogPosts.find((p) => p.slug === slug)
      if (!post) return <NotFoundPage />
      return <BlogDetailPage />
    }
    return <NotFoundPage />
  }

  const isPublic = isPublicPath(location.pathname)

  // Admin views
  if (view.startsWith("admin-") && isAdmin) {
    const adminContent = (() => {
      switch (view) {
        case "admin-dashboard":
          return <AdminDashboard navigate={handleNavigate} />
        case "admin-properties":
          return <PropertyManagement />
        case "admin-users":
          return <UserManagement />
        case "admin-bookings":
          return <BookingManagement />
        case "admin-appointments":
          return <AppointmentManagement />
        case "admin-fees":
          return <FeeManagement />
        case "admin-chat":
          return <AdminChatPage currentUserApi={currentUserApi} />
        case "admin-settings":
          return <SystemSettings />
        default:
          return <AdminDashboard navigate={handleNavigate} />
      }
    })()
    return (
      <>
        <Seo
          title="Quản trị - ResortRegistry"
          description="Trang quản trị hệ thống ResortRegistry."
          path={location.pathname}
          noindex
        />
        <div className="flex flex-col min-h-screen">
          <Navbar
            navigate={handleNavigate}
            currentUser={currentUser}
            isAdmin={isAdmin}
            onLogout={handleLogout}
          />
          <main className="flex-1">
            <Suspense fallback={<Loading />}>{adminContent}</Suspense>
          </main>
          <Footer navigate={handleNavigate} />
        </div>
      </>
    )
  }

  // Login page
  if (view === "login" && !isPublic) {
    return <LoginPage navigate={handleNavigate} onLogin={handleLogin} />
  }

  // Quên mật khẩu
  if (view === "forgot-password" && !isPublic) {
    return <ForgotPasswordPage navigate={handleNavigate} />
  }

  // User views with navbar+footer
  const userContent = (() => {
    switch (view) {
      case "home":
        return <HomePage navigate={handleNavigate} />
      case "listings":
        return <ListingsPage navigate={handleNavigate} />
      case "property-detail":
        if (!navData.property) return <ListingsPage navigate={handleNavigate} />
        return (
          <PropertyDetailPage
            property={navData.property}
            navigate={handleNavigate}
            currentUser={currentUser}
          />
        )
      case "booking-form":
        if (!navData.property || !currentUser || !navData.bookingParams)
          return <ListingsPage navigate={handleNavigate} />
        return (
          <>
            <Seo
              title="Đăng ký đặt chỗ - ResortRegistry"
              description="Đăng ký đặt chỗ nhà nghỉ dưỡng tại ResortRegistry."
              path="/booking-form"
              noindex
            />
            <BookingFormPage
              navigate={handleNavigate}
              property={navData.property}
              bookingParams={navData.bookingParams}
              currentUser={currentUser}
            />
          </>
        )
      case "booking-confirm":
        if (!navData.property || !navData.bookingParams || !navData.form)
          return <ListingsPage navigate={handleNavigate} />
        return (
          <>
            <Seo
              title="Xác nhận đặt chỗ - ResortRegistry"
              description="Xác nhận thông tin đặt chỗ nhà nghỉ dưỡng."
              path="/booking-confirm"
              noindex
            />
            <BookingConfirmPage
              navigate={handleNavigate}
              property={navData.property}
              bookingParams={{
                ...navData.bookingParams,
                endDate: navData.bookingParams.endDate || "",
              }}
              form={navData.form}
            />
          </>
        )
      case "payment":
        if (!navData.property || !navData.bookingParams || !navData.form)
          return <ListingsPage navigate={handleNavigate} />
        return (
          <>
            <Seo
              title="Thanh toán đặt chỗ - ResortRegistry"
              description="Thanh toán đặt chỗ nhà nghỉ dưỡng tại ResortRegistry."
              path="/payment"
              noindex
            />
            <PaymentPage
              navigate={handleNavigate}
              property={navData.property}
              bookingParams={{
                ...navData.bookingParams,
                endDate: navData.bookingParams.endDate || "",
              }}
              form={navData.form}
              currentUser={currentUserApi}
            />
          </>
        )
      case "profile":
        if (!currentUser || !currentUserApi)
          return <LoginPage navigate={handleNavigate} onLogin={handleLogin} />
        return (
          <>
            <Seo
              title="Hồ sơ tài khoản - ResortRegistry"
              description="Quản lý hồ sơ và thông tin tài khoản của bạn tại ResortRegistry."
              path="/profile"
              noindex
            />
            <UserProfilePage
              navigate={handleNavigate}
              currentUser={currentUser}
              currentUserApi={currentUserApi}
              onLogout={handleLogout}
              onProfileSaved={handleProfileSaved}
            />
          </>
        )
      case "history":
        if (!currentUser)
          return <LoginPage navigate={handleNavigate} onLogin={handleLogin} />
        return (
          <>
            <Seo
              title="Lịch sử đặt chỗ - ResortRegistry"
              description="Xem lịch sử đặt chỗ nhà nghỉ dưỡng của bạn tại ResortRegistry."
              path="/history"
              noindex
            />
            <BookingHistoryPage
              navigate={handleNavigate}
              userId={currentUserApi?.id}
            />
          </>
        )
      default:
        return <HomePage navigate={handleNavigate} />
    }
  })()

  const hideFooterViews: View[] = ["booking-form", "payment"]

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar
        navigate={handleNavigate}
        currentUser={currentUser}
        isAdmin={isAdmin}
        onLogout={handleLogout}
      />
      <main className="flex-1">
        <Suspense fallback={<Loading />}>
          {isPublic ? publicPage() : userContent}
        </Suspense>
      </main>
      {currentUserApi && (
        <Suspense fallback={<Loading />}>
          <ChatWidget currentUserApi={currentUserApi} />
        </Suspense>
      )}
      {(!isPublic && !hideFooterViews.includes(view)) ||
        (isPublic && view !== "payment" && (
          <Footer navigate={handleNavigate} />
        ))}
    </div>
  )
}
