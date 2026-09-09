import type { MetadataRoute } from 'next';
import { WEB_URL } from '@/lib/seo/organization';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/admin', '/api/'] },
    sitemap: `${WEB_URL}/sitemap.xml`,
  };
}
