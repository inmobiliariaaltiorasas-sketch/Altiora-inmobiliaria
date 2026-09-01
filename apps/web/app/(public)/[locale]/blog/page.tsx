import Link from 'next/link';
import type { Metadata } from 'next';
import type { SupportedLocale } from '@altiora/shared-types';
import { listPublicBlogPosts } from '@/lib/api/blog';

const COPY: Record<SupportedLocale, { title: string; empty: string }> = {
  'es-CO': { title: 'Blog', empty: 'Todavía no hay artículos publicados.' },
  'en-US': { title: 'Blog', empty: 'No articles published yet.' },
};

interface RouteParams {
  locale: string;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const { locale } = (await params) as { locale: SupportedLocale };
  return { title: `${COPY[locale].title} | ALTiora` };
}

export default async function BlogIndexPage({ params }: { params: Promise<RouteParams> }) {
  const { locale } = (await params) as { locale: SupportedLocale };
  const copy = COPY[locale];
  const posts = await listPublicBlogPosts(locale);

  return (
    <main className="container" style={{ padding: '2.5rem 1.5rem 3rem' }}>
      <h1 style={{ fontSize: '1.9rem' }}>{copy.title}</h1>

      {posts.length === 0 ? (
        <p style={{ marginTop: '1.5rem' }}>{copy.empty}</p>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(18rem, 1fr))',
            gap: '1.5rem',
            marginTop: '1.75rem',
          }}
        >
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/${locale}/blog/${post.slug}`}
              className="card"
              style={{ padding: '1.25rem', display: 'block', textDecoration: 'none' }}
            >
              <h2 style={{ fontSize: '1.1rem', color: 'var(--navy-900)' }}>
                {post.translation.title}
              </h2>
              <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', fontSize: '0.9rem' }}>
                {post.translation.excerpt}
              </p>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
