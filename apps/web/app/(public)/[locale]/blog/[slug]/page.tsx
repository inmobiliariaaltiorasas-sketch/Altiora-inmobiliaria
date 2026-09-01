import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import type { SupportedLocale } from '@altiora/shared-types';
import { getBlogPostBySlug } from '@/lib/api/blog';

const WEB_URL = process.env.NEXT_PUBLIC_WEB_URL ?? 'http://localhost:3000';

interface RouteParams {
  locale: string;
  slug: string;
}

function resolveTranslation(
  post: NonNullable<Awaited<ReturnType<typeof getBlogPostBySlug>>>,
  locale: SupportedLocale,
) {
  return post.translations.find((t) => t.locale === locale) ?? post.translations[0];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const { locale, slug } = (await params) as { locale: SupportedLocale; slug: string };
  const post = await getBlogPostBySlug(slug, locale);
  if (!post) return {};

  const translation = resolveTranslation(post, locale);
  const title = translation?.seoTitle ?? translation?.title ?? slug;
  const description = translation?.seoDescription ?? translation?.excerpt ?? '';
  const canonical = `${WEB_URL}/${locale}/blog/${slug}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<RouteParams> }) {
  const { locale, slug } = (await params) as { locale: SupportedLocale; slug: string };
  const post = await getBlogPostBySlug(slug, locale);
  if (!post) notFound();

  const translation = resolveTranslation(post, locale);
  const canonical = `${WEB_URL}/${locale}/blog/${slug}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        headline: translation?.title,
        description: translation?.excerpt,
        author: { '@type': 'Organization', name: 'ALTiora Construcciones e Inmobiliaria S.A.S.' },
        datePublished: post.publishedAt,
        dateModified: post.updatedAt,
        mainEntityOfPage: canonical,
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'ALTiora', item: `${WEB_URL}/${locale}` },
          { '@type': 'ListItem', position: 2, name: 'Blog', item: `${WEB_URL}/${locale}/blog` },
          { '@type': 'ListItem', position: 3, name: translation?.title, item: canonical },
        ],
      },
    ],
  };

  return (
    <main className="container" style={{ padding: '2rem 1.5rem 3rem', maxWidth: '42rem' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <h1 style={{ fontSize: '1.9rem' }}>{translation?.title}</h1>
      {post.publishedAt ? (
        <p style={{ color: 'var(--text-muted)', marginTop: '0.4rem', fontSize: '0.85rem' }}>
          {new Date(post.publishedAt).toLocaleDateString(locale)}
          {new Date(post.updatedAt).toDateString() !== new Date(post.publishedAt).toDateString()
            ? ` · ${locale === 'en-US' ? 'updated on' : 'actualizado el'} ${new Date(post.updatedAt).toLocaleDateString(locale)}`
            : ''}
        </p>
      ) : null}
      <p
        style={{
          marginTop: '1.5rem',
          color: 'var(--text)',
          whiteSpace: 'pre-line',
          lineHeight: 1.7,
        }}
      >
        {translation?.body}
      </p>
    </main>
  );
}
