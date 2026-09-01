import type { MetadataRoute } from 'next';
import { SUPPORTED_LOCALES } from '@altiora/shared-types';
import { listSitemapEntries } from '@/lib/api/properties';
import { getLocationsTree } from '@/lib/api/locations';
import { listBlogSitemapEntries } from '@/lib/api/blog';

const WEB_URL = process.env.NEXT_PUBLIC_WEB_URL ?? 'http://localhost:3000';

/** v1 sección 08: sitemap dinámico combinando propiedades publicadas + ciudades activas + blog, por idioma. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [properties, cities, blogPosts] = await Promise.all([
    listSitemapEntries(),
    getLocationsTree(),
    listBlogSitemapEntries(),
  ]);

  const entries: MetadataRoute.Sitemap = [];

  for (const locale of SUPPORTED_LOCALES) {
    entries.push({ url: `${WEB_URL}/${locale}`, changeFrequency: 'daily', priority: 1 });
    entries.push({
      url: `${WEB_URL}/${locale}/propiedades`,
      changeFrequency: 'daily',
      priority: 0.9,
    });
    entries.push({
      url: `${WEB_URL}/${locale}/contacto`,
      changeFrequency: 'monthly',
      priority: 0.3,
    });
    entries.push({
      url: `${WEB_URL}/${locale}/blog`,
      changeFrequency: 'weekly',
      priority: 0.5,
    });
    entries.push({
      url: `${WEB_URL}/${locale}/ciudades`,
      changeFrequency: 'weekly',
      priority: 0.6,
    });

    for (const post of blogPosts) {
      entries.push({
        url: `${WEB_URL}/${locale}/blog/${post.slug}`,
        lastModified: post.updatedAt,
        changeFrequency: 'monthly',
        priority: 0.4,
      });
    }

    for (const city of cities) {
      entries.push({
        url: `${WEB_URL}/${locale}/ciudades/${city.slug}`,
        changeFrequency: 'weekly',
        priority: 0.7,
      });
    }

    for (const property of properties) {
      entries.push({
        url: `${WEB_URL}/${locale}/propiedades/${property.slug}`,
        lastModified: property.updatedAt,
        changeFrequency: 'weekly',
        priority: 0.8,
      });
    }
  }

  return entries;
}
