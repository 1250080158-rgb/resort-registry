import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { blogPosts, type BlogPost } from '../../data/blogPosts';
import { blogCategories } from '../../data/blogSlugs';
import Seo from '../shared/Seo';

export default function BlogListPage() {
  const [category, setCategory] = useState<string>('');

  const filtered = useMemo(() => {
    if (!category) return blogPosts;
    return blogPosts.filter(post => post.category === category);
  }, [category]);

  return (
    <>
      <Seo
        title="Blog - Tin tức nghỉ dưỡng Việt Nam"
        description="Các bài viết về nghỉ dưỡng, thuê và mua biệt thự, bungalow tại Việt Nam. Kinh nghiệm và hướng dẫn thực tế."
        path="/blog"
      />
      <div className="min-h-screen bg-cream py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="font-display text-4xl sm:text-5xl text-navy font-semibold mb-4">Blog</h1>
            <p className="text-muted text-lg">Mẹo nghỉ dưỡng, kinh nghiệm đặt phòng và hướng dẫn mua nhà tại Việt Nam</p>
          </div>

          {/* Category filter */}
          <div className="flex justify-center gap-2 mb-12 flex-wrap">
            <button
              onClick={() => setCategory('')}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${!category ? 'bg-navy text-gold' : 'bg-navy-lighter text-cream/80 hover:text-gold'}`}
            >
              Tất cả
            </button>
            {blogCategories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${category === cat ? 'bg-navy text-gold' : 'bg-navy-lighter text-cream/80 hover:text-gold'}`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Posts grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map(post => (
              <article key={post.slug} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all group">
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={post.coverImage}
                    alt={post.coverAlt}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />
                </div>
                <div className="p-6">
                  <span className="text-gold text-xs font-semibold uppercase tracking-wide mb-2 block">{post.category}</span>
                  <h2 className="font-display text-xl text-navy font-semibold mb-2 line-clamp-2">
                    <Link to={`/blog/${post.slug}`} className="hover:text-teal transition-colors">
                      {post.title}
                    </Link>
                  </h2>
                  <p className="text-muted text-sm line-clamp-3 mb-4">{post.description}</p>
                  <div className="flex items-center justify-between text-xs text-muted">
                    <span>{new Date(post.publishedAt).toLocaleDateString('vi-VN')}</span>
                    <Link to={`/blog/${post.slug}`} className="text-teal hover:text-navy font-medium">
                      Đọc thêm →
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-20">
              <p className="text-muted text-lg">Không có bài viết nào trong chuyên mục này.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
