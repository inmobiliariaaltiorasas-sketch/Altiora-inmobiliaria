import { getLocationsTree } from '@/lib/api/locations';
import { listPropertyFacets } from '@/lib/api/properties';
import { selectAllCategories } from '@/lib/seo/categories';
import { buildLlmsTxt } from '@/lib/seo/llms-txt';
import { SITE_URL } from '@/lib/seo/site-url';

export const revalidate = 3600;

/**
 * `/llms.txt`: not captured by the locale middleware, whose matcher skips any path with a dot.
 * Categories degrade to none when the API has no facets endpoint, like the sitemap.
 */
export async function GET(): Promise<Response> {
  const [cities, facets] = await Promise.all([getLocationsTree(), listPropertyFacets()]);

  const body = buildLlmsTxt({
    baseUrl: SITE_URL,
    cities,
    categories: selectAllCategories(facets, cities),
  });

  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
