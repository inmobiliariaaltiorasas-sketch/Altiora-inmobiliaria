import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import type { SupportedLocale } from '@altiora/shared-types';
import { getBlogPostBySlug } from '@/lib/api/blog';
import { resolveDetailAlternates } from '@/lib/seo/alternates';
import { ORGANIZATION_ID, ORGANIZATION_INFO } from '@/lib/seo/organization';
import { SITE_URL } from '@/lib/seo/site-url';
import styles from './page.module.css';

const COPY: Record<SupportedLocale, { breadcrumb: string; updatedOn: string; backToBlog: string }> =
  {
    'es-CO': { breadcrumb: 'Blog', updatedOn: 'actualizado el', backToBlog: 'Volver al blog' },
    'en-US': { breadcrumb: 'Blog', updatedOn: 'updated on', backToBlog: 'Back to blog' },
  };

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
  const alternates = resolveDetailAlternates({
    baseUrl: SITE_URL,
    locale,
    path: `/blog/${slug}`,
    availableLocales: post.translations.map((t) => t.locale),
  });

  return {
    title,
    description,
    alternates,
    openGraph: {
      title,
      description,
      url: alternates.canonical,
      siteName: 'ALTiora',
      type: 'article',
      images: [{ url: ORGANIZATION_INFO.logo }],
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<RouteParams> }) {
  const { locale, slug } = (await params) as { locale: SupportedLocale; slug: string };
  const copy = COPY[locale];
  const post = await getBlogPostBySlug(slug, locale);
  if (!post) notFound();

  const translation = resolveTranslation(post, locale);
  const canonical = `${SITE_URL}/${locale}/blog/${slug}`;

  const publishedAt = post.publishedAt ? new Date(post.publishedAt) : null;
  const updatedAt = new Date(post.updatedAt);
  const wasUpdated = publishedAt ? updatedAt.toDateString() !== publishedAt.toDateString() : false;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BlogPosting',
        headline: translation?.title,
        description: translation?.excerpt,
        image: [ORGANIZATION_INFO.logo],
        author: { '@id': ORGANIZATION_ID },
        publisher: { '@id': ORGANIZATION_ID },
        datePublished: post.publishedAt,
        dateModified: post.updatedAt,
        mainEntityOfPage: canonical,
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'ALTiora', item: `${SITE_URL}/${locale}` },
          { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_URL}/${locale}/blog` },
          { '@type': 'ListItem', position: 3, name: translation?.title, item: canonical },
        ],
      },
    ],
  };

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav
        className={`container ${styles.breadcrumb}`}
        aria-label={locale === 'es-CO' ? 'Ruta de navegación' : 'Breadcrumb'}
      >
        <Link href={`/${locale}/blog`}>← {copy.breadcrumb}</Link>
      </nav>

      <article className={`container ${styles.article}`}>
        <h1 className={styles.title}>{translation?.title}</h1>
        {publishedAt ? (
          <p className={styles.meta}>
            {publishedAt.toLocaleDateString(locale, {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
            {wasUpdated
              ? ` · ${copy.updatedOn} ${updatedAt.toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' })}`
              : ''}
          </p>
        ) : null}

        <div className={styles.body}>{translation?.body}</div>

        <div className={styles.footer}>
          <Link href={`/${locale}/blog`} className={styles.backLink}>
            ← {copy.backToBlog}
          </Link>
        </div>
      </article>
    </main>
  );
}
