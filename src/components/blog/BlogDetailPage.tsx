import { useLocation } from 'react-router-dom';
import { blogPosts, type BlogPost } from '../../data/blogPosts';
import Seo from '../shared/Seo';

// Chuyển link dạng [chữ](/đường-dẫn) bên trong đoạn văn thành thẻ <a> thật
// (tránh hiện nguyên văn dấu ngoặc vuông trên trang bài viết)
function renderInline(text: string) {
  return text.split(/(\[[^\]]+\]\([^)]+\))/g).map((part, i) => {
    const match = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (match) {
      return (
        <a
          key={i}
          href={match[2]}
          className="text-teal hover:text-navy font-semibold underline decoration-teal/30 hover:decoration-navy"
        >
          {match[1]}
        </a>
      );
    }
    return part;
  });
}

function renderBlock(block: any) {
  switch (block.type) {
    case 'h2': return <h2 key={block.text} className="font-display text-2xl text-navy font-semibold my-6 mb-3">{block.text}</h2>;
    case 'h3': return <h3 key={block.text} className="font-display text-xl text-navy font-semibold my-4 mb-2">{block.text}</h3>;
    case 'p': return <p key={block.text} className="text-navy/80 text-sm leading-relaxed mb-4">{renderInline(block.text)}</p>;
    case 'list': return (
      <ul key={JSON.stringify(block.items)} className="list-disc list-inside text-navy/80 text-sm leading-relaxed mb-4 space-y-1">
        {block.items.map((item: string) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    );
    case 'image': return (
      <div key={block.src} className="my-6 rounded-xl overflow-hidden border border-cream-dark">
        <img src={block.src} alt={block.alt} className="w-full h-auto block" loading="lazy" />
      </div>
    );
    case 'internalLink': return (
      <p key={block.text} className="text-center my-6">
        <a href={block.to} className="text-teal hover:text-navy font-semibold underline decoration-teal/30 hover:decoration-navy">
          {block.text}
        </a>
      </p>
    );
    default: return null;
  }
}

export default function BlogDetailPage() {
  // App không dựng <Routes> nên useParams() luôn rỗng; slug phải đọc từ URL thực tế.
  const slug = useLocation().pathname.replace(/^\/blog\/?/, '');
  const post = blogPosts.find(p => p.slug === slug);

  if (!post) {
    return (
      <div className="min-h-screen bg-cream py-20 px-6 text-center">
        <h1 className="font-display text-2xl font-semibold text-navy">Bài viết không tìm thấy</h1>
        <p className="text-muted mt-4">Bài viết bạn tìm không tồn tại.</p>
      </div>
    );
  }

  const h2Headings = post.content.filter(b => b.type === 'h2').map(b => b.text);

  return (
    <>
      <Seo
        title={post.title}
        description={post.description}
        path={`/blog/${post.slug}`}
        image={post.coverImage}
        type="article"
        publishedTime={post.publishedAt}
        jsonLd={[
          {
            '@type': 'Article',
            headline: post.title,
            description: post.description,
            datePublished: post.publishedAt,
            dateModified: post.updatedAt,
            image: post.coverImage,
            author: { '@type': 'Organization', name: 'ResortRegistry' },
            publisher: { '@type': 'Organization', name: 'ResortRegistry' },
          },
          {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Trang chủ', item: 'https://resortregistry.vercel.app/' },
              { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://resortregistry.vercel.app/blog' },
              { '@type': 'ListItem', position: 3, name: post.title, item: `https://resortregistry.vercel.app/blog/${post.slug}` },
            ],
          },
        ]}
      />
      <div className="min-h-screen bg-cream py-12 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs text-muted mb-6">
            <a href="/" className="hover:text-teal">Trang chủ</a>
            <span>/</span>
            <a href="/blog" className="hover:text-teal">Blog</a>
            <span>/</span>
            <span className="text-navy">{post.title}</span>
          </nav>

          {/* Cover image */}
          <div className="rounded-2xl overflow-hidden mb-8 shadow-lg">
            <img src={post.coverImage} alt={post.coverAlt} className="w-full h-auto block" loading="lazy" />
          </div>

          <h1 className="font-display text-3xl sm:text-4xl text-navy font-semibold mb-2">{post.title}</h1>
          <p className="text-muted text-sm mb-8">
            {post.category} · {new Date(post.publishedAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
          </p>

          {/* Table of contents */}
          {h2Headings.length > 0 && (
            <div className="bg-white rounded-2xl p-6 mb-10 border border-cream-dark">
              <h3 className="font-display text-lg text-navy font-semibold mb-3">Mục lục</h3>
              <ul className="space-y-2 text-sm">
                {h2Headings.map((heading, i) => (
                  <li key={i}>
                    <a href={`#${heading.toLowerCase().replace(/\s+/g, '-')}`} className="text-muted hover:text-navy">
                      {heading}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Content */}
          <div className="prose prose-lg text-navy/80 max-w-none mb-12">
            {post.content.map((block, i) => renderBlock(block))}
          </div>

          {/* Related posts */}
          <div className="bg-white rounded-2xl p-8 border border-cream-dark mb-12">
            <h2 className="font-display text-xl text-navy font-semibold mb-6">Bài liên quan</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {blogPosts
                .filter(p => p.category === post.category && p.slug !== post.slug)
                .slice(0, 3)
                .map(related => (
                  <article key={related.slug} className="p-4 border border-cream-dark rounded-xl hover:border-gold/40 transition-colors">
                    <h3 className="font-display text-lg text-navy font-semibold mb-2 line-clamp-1">
                      <a href={`/blog/${related.slug}`} className="hover:text-teal transition-colors">
                        {related.title}
                      </a>
                    </h3>
                    <p className="text-muted text-sm line-clamp-2">{related.description}</p>
                  </article>
                ))}
            </div>
          </div>

          {/* CTA to listings */}
          <div className="bg-navy rounded-2xl p-8 text-center">
            <h2 className="font-display text-2xl text-cream font-semibold mb-4">Tìm nhà nghỉ dưỡng phù hợp</h2>
            <p className="text-cream/60 mb-6 max-w-md mx-auto">Duyệt danh sách biệt thự, bungalow, penthouse tại Việt Nam và đặt chỗ ngay hôm nay.</p>
            <a
              href="/danh-sach-nha"
              className="inline-block bg-gold text-navy font-semibold px-8 py-3 rounded-xl hover:bg-gold-light transition-colors"
            >
              Xem danh sách nhà
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
