import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import {
  DEFAULT_LOCALE,
  type BlogPostDetailDto,
  type BlogPostSummaryDto,
  type BlogSitemapEntryDto,
  type SupportedLocale,
} from '@altiora/shared-types';
import { slugify } from '../../../common/utils/slugify';
import { WebRevalidationService } from '../../../common/services/web-revalidation.service';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { AuditLogsService } from '../../audit-logs/application/audit-logs.service';
import type { CreateBlogPostDto } from './dto/create-blog-post.dto';
import type { UpdateBlogPostDto } from './dto/update-blog-post.dto';

const detailInclude = {
  author: { select: { name: true } },
  translations: true,
} satisfies Prisma.BlogPostInclude;

type BlogPostRow = Prisma.BlogPostGetPayload<{ include: typeof detailInclude }>;

@Injectable()
export class BlogService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogsService: AuditLogsService,
    private readonly revalidationService: WebRevalidationService,
  ) {}

  async listPublished(locale: SupportedLocale): Promise<BlogPostSummaryDto[]> {
    const posts = await this.prisma.blogPost.findMany({
      where: { status: 'PUBLISHED' },
      include: detailInclude,
      orderBy: { publishedAt: 'desc' },
    });
    return posts.map((post) => this.toSummary(post, locale));
  }

  async findPublicBySlugOrThrow(slug: string, locale: SupportedLocale): Promise<BlogPostDetailDto> {
    const post = await this.prisma.blogPost.findUnique({ where: { slug }, include: detailInclude });
    if (!post || post.status !== 'PUBLISHED') {
      throw new NotFoundException(`Artículo no encontrado: ${slug}`);
    }
    return this.toDetail(post, locale);
  }

  async listAdmin(): Promise<BlogPostSummaryDto[]> {
    const posts = await this.prisma.blogPost.findMany({
      include: detailInclude,
      orderBy: { createdAt: 'desc' },
    });
    return posts.map((post) => this.toSummary(post, DEFAULT_LOCALE));
  }

  async findAdminByIdOrThrow(id: string): Promise<BlogPostDetailDto> {
    const post = await this.prisma.blogPost.findUnique({ where: { id }, include: detailInclude });
    if (!post) throw new NotFoundException(`Artículo no encontrado: ${id}`);
    return this.toDetail(post, DEFAULT_LOCALE);
  }

  async create(dto: CreateBlogPostDto, actorUserId: string): Promise<BlogPostDetailDto> {
    const baseTranslation =
      dto.translations.find((t) => t.locale === DEFAULT_LOCALE) ?? dto.translations[0];
    if (!baseTranslation) throw new BadRequestException('Se necesita al menos una traducción');
    const slug = await this.generateUniqueSlug(baseTranslation.title);

    const created = await this.prisma.blogPost.create({
      data: {
        slug,
        needsReview: dto.needsReview ?? false,
        cityId: dto.cityId,
        authorId: actorUserId,
        translations: { create: dto.translations },
      },
      include: detailInclude,
    });

    await this.auditLogsService.record({
      userId: actorUserId,
      entity: 'BlogPost',
      entityId: created.id,
      action: 'CREATE',
    });

    return this.toDetail(created, DEFAULT_LOCALE);
  }

  async update(
    id: string,
    dto: UpdateBlogPostDto,
    actorUserId: string,
  ): Promise<BlogPostDetailDto> {
    const existing = await this.prisma.blogPost.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Artículo no encontrado: ${id}`);

    const becomingPublished = dto.status === 'PUBLISHED' && existing.status !== 'PUBLISHED';

    await this.prisma.blogPost.update({
      where: { id },
      data: {
        cityId: dto.cityId,
        needsReview: dto.needsReview,
        status: dto.status,
        publishedAt: becomingPublished ? new Date() : undefined,
      },
    });

    // Upsert por locale — nunca deleteMany+create de todas las traducciones: un editor que solo
    // toca es-CO no debe poder borrar sin querer la traducción en-US existente de otro locale.
    if (dto.translations) {
      for (const translation of dto.translations) {
        await this.prisma.blogPostTranslation.upsert({
          where: { blogPostId_locale: { blogPostId: id, locale: translation.locale } },
          update: translation,
          create: { ...translation, blogPostId: id },
        });
      }
    }

    await this.auditLogsService.record({
      userId: actorUserId,
      entity: 'BlogPost',
      entityId: id,
      action: dto.status ? (dto.status === 'PUBLISHED' ? 'PUBLISH' : 'UPDATE') : 'UPDATE',
      diff: { statusBefore: existing.status, statusAfter: dto.status ?? existing.status },
    });

    const updated = await this.findAdminByIdOrThrow(id);
    if (becomingPublished || dto.status) {
      await this.revalidationService.revalidateBlogPost(updated.slug);
    }
    return updated;
  }

  async listSitemapEntries(): Promise<BlogSitemapEntryDto[]> {
    const posts = await this.prisma.blogPost.findMany({
      where: { status: 'PUBLISHED' },
      select: { slug: true, updatedAt: true },
    });
    return posts.map((post) => ({ slug: post.slug, updatedAt: post.updatedAt.toISOString() }));
  }

  private async generateUniqueSlug(title: string): Promise<string> {
    const base = slugify(title);
    let candidate = base;
    let suffix = 2;
    while (await this.prisma.blogPost.findUnique({ where: { slug: candidate } })) {
      candidate = `${base}-${suffix}`;
      suffix += 1;
    }
    return candidate;
  }

  private resolveTranslation(post: BlogPostRow, locale: SupportedLocale) {
    return post.translations.find((t) => t.locale === locale) ?? post.translations[0];
  }

  private toSummary(post: BlogPostRow, locale: SupportedLocale): BlogPostSummaryDto {
    const translation = this.resolveTranslation(post, locale);
    return {
      id: post.id,
      slug: post.slug,
      status: post.status,
      needsReview: post.needsReview,
      publishedAt: post.publishedAt ? post.publishedAt.toISOString() : null,
      cityId: post.cityId,
      authorName: post.author?.name ?? null,
      translation: {
        locale: (translation?.locale as SupportedLocale) ?? DEFAULT_LOCALE,
        title: translation?.title ?? '(sin título)',
        excerpt: translation?.excerpt ?? '',
      },
    };
  }

  private toDetail(post: BlogPostRow, locale: SupportedLocale): BlogPostDetailDto {
    return {
      ...this.toSummary(post, locale),
      updatedAt: post.updatedAt.toISOString(),
      translations: post.translations.map((t) => ({
        locale: t.locale as SupportedLocale,
        title: t.title,
        excerpt: t.excerpt,
        body: t.body,
        seoTitle: t.seoTitle,
        seoDescription: t.seoDescription,
      })),
    };
  }
}
