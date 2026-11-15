import { Helmet } from 'react-helmet-async';

interface SeoProps {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: 'website' | 'article';
  noindex?: boolean;
  publishedTime?: string;
  jsonLd?: Array<Record<string, unknown>>;
}

const SITE = 'https://resortregistry.vercel.app';
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&h=630&fit=crop&auto=format';

function clean<T extends Record<string, unknown>>(obj: T): T {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined && value !== null) {
      result[key] = value;
    }
  }
  return result as T;
}

export default function Seo({
  title,
  description,
  path,
  image,
  type = 'website',
  noindex,
  publishedTime,
  jsonLd,
}: SeoProps) {
  const canonical = `${SITE}${path}`;
  const ogImage = image || DEFAULT_IMAGE;

  const baseJsonLd: Array<Record<string, unknown>> = [
    clean({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: title,
      description,
      url: canonical,
      inLanguage: 'vi-VN',
    }),
  ];

  const allJsonLd = [...baseJsonLd, ...(jsonLd || [])];

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="robots" content={noindex ? 'noindex, nofollow' : 'index, follow'} />
      <link rel="canonical" href={canonical} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={ogImage} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {allJsonLd.map((ld, i) => (
        <script
          key={`json-ld-${i}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
        />
      ))}
    </Helmet>
  );
}
