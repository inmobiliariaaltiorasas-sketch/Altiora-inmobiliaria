import type {
  BlogPostDetailDto,
  BlogPostSummaryDto,
  BlogSitemapEntryDto,
  SupportedLocale,
} from '@altiora/shared-types';
import { ApiError, apiClient } from '@/lib/api-client';

export function listPublicBlogPosts(locale: SupportedLocale): Promise<BlogPostSummaryDto[]> {
  return apiClient(`/blog?locale=${locale}`, { next: { revalidate: 60 } });
}

export async function getBlogPostBySlug(
  slug: string,
  locale: SupportedLocale,
): Promise<BlogPostDetailDto | null> {
  try {
    return await apiClient(`/blog/${slug}?locale=${locale}`, { next: { revalidate: 60 } });
  } catch (error) {
    // Only a definitive 404 means "gone"; any other failure must surface as a 5xx.
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

export function listBlogSitemapEntries(): Promise<BlogSitemapEntryDto[]> {
  return apiClient('/blog/sitemap-entries', { next: { revalidate: 300 } });
}
