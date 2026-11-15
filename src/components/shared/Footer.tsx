import { Link } from 'react-router-dom';
import { View } from '../../data/mockData';

interface FooterProps {
  navigate: (view: View, data?: unknown) => void;
}

export default function Footer({ navigate }: FooterProps) {
  return (
    <footer className="bg-navy text-cream/70 mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-sm bg-gold flex items-center justify-center">
              <span className="font-display text-navy font-bold text-sm">R</span>
            </div>
            <Link to="/" className="flex items-center gap-2">
              <span className="font-display text-xl">
                <span className="text-cream">Resort</span>
                <span className="text-gold">Registry</span>
              </span>
            </Link>
          </div>
          <p className="text-sm leading-relaxed text-cream/60">
            Nền tảng đăng ký và quản lý nhà ở khu nghỉ dưỡng cao cấp hàng đầu Việt Nam.
          </p>
          <div className="flex gap-3 mt-4">
            {['facebook', 'instagram', 'linkedin', 'github'].map(s => (
              <a
                key={s}
                href={s === 'github' ? 'https://github.com/1250080158-rgb/resort-registry' : '#'}
                target={s === 'github' ? '_blank' : undefined}
                rel={s === 'github' ? 'noopener noreferrer' : undefined}
                className="w-8 h-8 rounded-full bg-navy-lighter flex items-center justify-center hover:bg-gold hover:text-navy transition-all text-xs uppercase"
              >
                {s === 'github' ? 'GH' : s[0]}
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-cream mb-3">Khám Phá</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/" className="hover:text-gold transition-colors">
                Trang Chủ
              </Link>
            </li>
            <li>
              <Link to="/danh-sach-nha" className="hover:text-gold transition-colors">
                Danh Sách Nhà
              </Link>
            </li>
            <li>
              <Link to="/thue-biet-thu-nghi-duong" className="hover:text-gold transition-colors">
                Khu Nghỉ Dưỡng
              </Link>
            </li>
            <li><a href="#" className="hover:text-gold transition-colors">Ưu Đãi Đặc Biệt</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-cream mb-3">Hỗ Trợ</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-gold transition-colors">Câu Hỏi Thường Gặp</a></li>
            <li><a href="#" className="hover:text-gold transition-colors">Chính Sách Hủy Đặt</a></li>
            <li><a href="#" className="hover:text-gold transition-colors">Điều Khoản Sử Dụng</a></li>
            <li><a href="#" className="hover:text-gold transition-colors">Chính Sách Bảo Mật</a></li>
            <li><a href="#" className="hover:text-gold transition-colors">Liên Hệ Chúng Tôi</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-cream mb-3">Liên Hệ</h4>
          <ul className="space-y-2 text-sm text-cream/60">
            <li className="flex gap-2 items-start">
              <span className="text-gold mt-0.5">📍</span>
              <span>5 chục thì cho địa chỉ</span>
            </li>
            <li className="flex gap-2 items-center">
              <span className="text-gold">📞</span>
              <span>1800 8888 (Miễn phí)</span>
            </li>
            <li className="flex gap-2 items-center">
              <span className="text-gold">✉️</span>
              <span>support@resortregistry.vn</span>
            </li>
          </ul>
          <div className="mt-4 p-3 bg-navy-lighter rounded-lg">
            <p className="text-xs text-gold font-semibold mb-1">Chứng Nhận Bảo Mật</p>
            <p className="text-xs text-cream/50">SSL 256-bit · PCI DSS Compliant · ISO 27001</p>
          </div>
        </div>
      </div>

      <div className="border-t border-navy-lighter">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-cream/40">© 2026 ResortRegistry. Bản quyền thuộc về công ty TNHH Resort Registry Việt Nam.</p>
          <div className="flex gap-4">
            <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-4 opacity-40 hover:opacity-70 transition-opacity" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-4 opacity-40 hover:opacity-70 transition-opacity" />
          </div>
        </div>
      </div>
    </footer>
  );
}
