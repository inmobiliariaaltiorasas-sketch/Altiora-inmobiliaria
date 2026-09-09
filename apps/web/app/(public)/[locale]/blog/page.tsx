import Link from 'next/link';
import type { Metadata } from 'next';
import type { SupportedLocale } from '@altiora/shared-types';
import { listPublicBlogPosts } from '@/lib/api/blog';
import { buildWhatsAppLink } from '@/lib/whatsapp';
import styles from './page.module.css';

const WEB_URL = process.env.NEXT_PUBLIC_WEB_URL ?? 'http://localhost:3000';

const COPY: Record<
  SupportedLocale,
  {
    eyebrow: string;
    title: string;
    lede: string;
    readMore: string;
    emptyTitle: string;
    emptyBody: string;
    emptyCta: string;
  }
> = {
  'es-CO': {
    eyebrow: 'BLOG ALTIORA',
    title: 'Guías y consejos para tu próxima decisión inmobiliaria',
    lede: 'Contenido pensado para que compres, vendas o arriendes con información clara, sin letra pequeña.',
    readMore: 'Leer artículo',
    emptyTitle: 'Próximamente nuevas guías',
    emptyBody:
      'Estamos preparando contenidos sobre compra, venta, financiación e inversión inmobiliaria en Cartago.',
    emptyCta: 'Hablar con un asesor',
  },
  'en-US': {
    eyebrow: 'ALTIORA BLOG',
    title: 'Guides and advice for your next real estate decision',
    lede: 'Content built so you buy, sell or rent with clear information, no fine print.',
    readMore: 'Read article',
    emptyTitle: 'New guides coming soon',
    emptyBody:
      "We're preparing content about buying, selling, financing and investing in real estate in Cartago.",
    emptyCta: 'Talk to an advisor',
  },
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
  const copy = COPY[locale];
  const url = `${WEB_URL}/${locale}/blog`;

  return {
    title: `${copy.title} | ALTiora`,
    description: copy.lede,
    alternates: { canonical: url },
    openGraph: {
      title: `${copy.title} | ALTiora`,
      description: copy.lede,
      url,
      siteName: 'ALTiora',
      type: 'website',
    },
  };
}

export default async function BlogIndexPage({ params }: { params: Promise<RouteParams> }) {
  const { locale } = (await params) as { locale: SupportedLocale };
  const copy = COPY[locale];
  const posts = await listPublicBlogPosts(locale);
  const whatsappLink = buildWhatsAppLink(
    locale === 'es-CO'
      ? 'Hola, quisiera recibir asesoría inmobiliaria.'
      : 'Hi, I would like real estate guidance.',
  );

  return (
    <main>
      <div className={`container ${styles.intro}`}>
        <span className="eyebrow">{copy.eyebrow}</span>
        <h1 className={styles.tagline}>{copy.title}</h1>
        <p className={styles.lede}>{copy.lede}</p>
      </div>

      <section className="container section" style={{ paddingTop: 0 }}>
        {posts.length === 0 ? (
          <div className={`card ${styles.empty}`}>
            <h2 className={styles.emptyTitle}>{copy.emptyTitle}</h2>
            <p className={styles.emptyBody}>{copy.emptyBody}</p>
            <Link href={whatsappLink ?? `/${locale}/contacto`} className="btn btn-primary">
              {copy.emptyCta}
            </Link>
          </div>
        ) : (
          <div className={styles.grid}>
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/${locale}/blog/${post.slug}`}
                className={`card ${styles.postCard}`}
              >
                {post.publishedAt ? (
                  <span className={styles.postDate}>
                    {new Date(post.publishedAt).toLocaleDateString(locale, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                ) : null}
                <h2 className={styles.postTitle}>{post.translation.title}</h2>
                <p className={styles.postExcerpt}>{post.translation.excerpt}</p>
                <span className={styles.postCta}>{copy.readMore} →</span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
