import type { SupportedLocale } from './locale';

export const BLOG_POST_STATUSES = ['DRAFT', 'PUBLISHED'] as const;
export type BlogPostStatus = (typeof BLOG_POST_STATUSES)[number];

export interface BlogPostTranslationDto {
  locale: SupportedLocale;
  title: string;
  excerpt: string;
  body: string;
  seoTitle: string | null;
  seoDescription: string | null;
}

/** Tarjeta de listado — no incluye el cuerpo completo. */
export interface BlogPostSummaryDto {
  id: string;
  slug: string;
  status: BlogPostStatus;
  needsReview: boolean;
  publishedAt: string | null;
  cityId: string | null;
  authorName: string | null;
  translation: Pick<BlogPostTranslationDto, 'locale' | 'title' | 'excerpt'>;
}

export interface BlogPostDetailDto extends BlogPostSummaryDto {
  translations: BlogPostTranslationDto[];
  /** Fase 4 GEO — fecha real visible en el post, no solo en metadata (v1 sección 9). */
  updatedAt: string;
}

export interface UpsertBlogPostTranslationDto {
  locale: SupportedLocale;
  title: string;
  excerpt: string;
  body: string;
  seoTitle?: string;
  seoDescription?: string;
}

export interface CreateBlogPostDto {
  cityId?: string;
  needsReview?: boolean;
  translations: UpsertBlogPostTranslationDto[];
}

export type UpdateBlogPostDto = Partial<Omit<CreateBlogPostDto, 'translations'>> & {
  translations?: UpsertBlogPostTranslationDto[];
};

export interface BlogSitemapEntryDto {
  slug: string;
  updatedAt: string;
}
