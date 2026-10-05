import type { MetadataRoute } from 'next';
import { getLocationsTree } from '@/lib/api/locations';
import { listSitemapEntries } from '@/lib/api/properties';
import { listBlogSitemapEntries } from '@/lib/api/blog';
import { buildSitemapEntries } from '@/lib/seo/sitemap-entries';
import { SITE_URL } from '@/lib/seo/site-url';

const STATIC_PATHS = ['', '/propiedades', '/ciudades', '/blog', '/nosotros', '/contacto'];

/** Sitemap dinámico — apunta a `robots.ts`, faltaba implementarse (v1 sección 9, SEO). */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [cities, properties, posts] = await Promise.all([
    getLocationsTree(),
    listSitemapEntries(),
    listBlogSitemapEntries(),
  ]);

  return buildSitemapEntries({
    baseUrl: SITE_URL,
    staticPaths: STATIC_PATHS,
    cities,
    properties,
    posts,
  });
}
