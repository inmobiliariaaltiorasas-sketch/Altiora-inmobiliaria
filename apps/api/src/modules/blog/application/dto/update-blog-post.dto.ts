import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { BLOG_POST_STATUSES, type BlogPostStatus } from '@altiora/shared-types';
import { BlogTranslationDto } from './blog-translation.dto';

export class UpdateBlogPostDto {
  @IsOptional()
  @IsString()
  cityId?: string;

  @IsOptional()
  @IsBoolean()
  needsReview?: boolean;

  /** DRAFT<->PUBLISHED — publicar es un cambio de estado explícito, no automático (v1 sección 22). */
  @IsOptional()
  @IsIn(BLOG_POST_STATUSES)
  status?: BlogPostStatus;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => BlogTranslationDto)
  translations?: BlogTranslationDto[];
}
