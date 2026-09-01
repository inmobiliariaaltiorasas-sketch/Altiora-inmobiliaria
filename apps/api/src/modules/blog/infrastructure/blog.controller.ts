import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import type {
  BlogPostDetailDto,
  BlogPostSummaryDto,
  BlogSitemapEntryDto,
  JwtPayload,
  SupportedLocale,
} from '@altiora/shared-types';
import { DEFAULT_LOCALE } from '@altiora/shared-types';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { RequirePermission } from '../../../common/decorators/require-permission.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { BlogService } from '../application/blog.service';
import { CreateBlogPostDto } from '../application/dto/create-blog-post.dto';
import { UpdateBlogPostDto } from '../application/dto/update-blog-post.dto';

@Controller('blog')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  // --- Público — solo artículos PUBLISHED (v1 sección 3 de correcciones: navegación libre) ---

  @Get()
  list(@Query('locale') locale: SupportedLocale = DEFAULT_LOCALE): Promise<BlogPostSummaryDto[]> {
    return this.blogService.listPublished(locale);
  }

  @Get('sitemap-entries')
  sitemapEntries(): Promise<BlogSitemapEntryDto[]> {
    return this.blogService.listSitemapEntries();
  }

  // --- Admin — antes de ':slug' para no ser interpretadas como un slug ---

  @Get('admin')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('content', 'manage')
  listAdmin(): Promise<BlogPostSummaryDto[]> {
    return this.blogService.listAdmin();
  }

  @Get('admin/:id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('content', 'manage')
  findAdminById(@Param('id') id: string): Promise<BlogPostDetailDto> {
    return this.blogService.findAdminByIdOrThrow(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('content', 'manage')
  create(
    @Body() dto: CreateBlogPostDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<BlogPostDetailDto> {
    return this.blogService.create(dto, user.sub);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('content', 'manage')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateBlogPostDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<BlogPostDetailDto> {
    return this.blogService.update(id, dto, user.sub);
  }

  // --- Público — SIEMPRE al final ---

  @Get(':slug')
  findBySlug(
    @Param('slug') slug: string,
    @Query('locale') locale: SupportedLocale = DEFAULT_LOCALE,
  ): Promise<BlogPostDetailDto> {
    return this.blogService.findPublicBySlugOrThrow(slug, locale);
  }
}
