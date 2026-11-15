import { Link } from 'react-router-dom';
import Seo from './Seo';

export default function NotFoundPage() {
  return (
    <>
      <Seo
        title="Trang không tìm thấy - ResortRegistry"
        description="Trang bạn tìm không có trên ResortRegistry. Quay về trang chủ để tiếp tục khám phá biệt thự, bungalow và penthouse nghỉ dưỡng."
        path="*"
        noindex
      />
      <div className="min-h-screen flex flex-col items-center justify-center bg-cream text-navy p-6">
        <div className="text-center max-w-md">
          <p className="text-6xl font-bold mb-2">404</p>
          <h1 className="font-display text-2xl font-semibold mb-4">Trang không tìm thấy</h1>
          <p className="text-muted mb-8">
            Đường dẫn bạn truy cập không tồn tại trên ResortRegistry.
          </p>
          <Link
            to="/"
            className="bg-navy text-gold font-semibold px-6 py-3 rounded-xl hover:bg-navy-light transition-colors"
          >
            Về trang chủ
          </Link>
        </div>
      </div>
    </>
  );
}
