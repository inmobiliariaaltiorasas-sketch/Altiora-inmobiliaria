import type { MetadataRoute } from 'next';
import { SUPPORTED_LOCALES } from '@/lib/locales';
import { getLocationsTree } from '@/lib/api/locations';
import { listSitemapEntries } from '@/lib/api/properties';
import { listBlogSitemapEntries } from '@/lib/api/blog';

const WEB_URL = process.env.NEXT_PUBLIC_WEB_URL ?? 'http://localhost:3000';

const STATIC_PATHS = [
  '',
  '/propiedades',
  '/ciudades',
  '/blog',
  '/nosotros',
  '/contacto',
  '/calculadora-credito',
];

/** Sitemap dinámico — apunta a `robots.ts`, faltaba implementarse (v1 sección 9, SEO). */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [cities, properties, posts] = await Promise.all([
    getLocationsTree(),
    listSitemapEntries(),
    listBlogSitemapEntries(),
  ]);

  const entries: MetadataRoute.Sitemap = [];

  for (const locale of SUPPORTED_LOCALES) {
    for (const path of STATIC_PATHS) {
      entries.push({ url: `${WEB_URL}/${locale}${path}`, changeFrequency: 'weekly' });
    }
    for (const city of cities) {
      entries.push({ url: `${WEB_URL}/${locale}/ciudades/${city.slug}`, changeFrequency: 'weekly' });
    }
    for (const property of properties) {
      entries.push({
        url: `${WEB_URL}/${locale}/propiedades/${property.slug}`,
        lastModified: property.updatedAt,
        changeFrequency: 'daily',
      });
    }
    for (const post of posts) {
      entries.push({
        url: `${WEB_URL}/${locale}/blog/${post.slug}`,
        lastModified: post.updatedAt,
        changeFrequency: 'monthly',
      });
    }
  }

  return entries;
}
