import { IsIn, IsOptional, IsString, MinLength } from 'class-validator';
import { SUPPORTED_LOCALES, type SupportedLocale } from '@altiora/shared-types';

export class BlogTranslationDto {
  @IsIn(SUPPORTED_LOCALES)
  locale!: SupportedLocale;

  @IsString()
  @MinLength(3)
  title!: string;

  @IsString()
  @MinLength(10)
  excerpt!: string;

  @IsString()
  @MinLength(20)
  body!: string;

  @IsOptional()
  @IsString()
  seoTitle?: string;

  @IsOptional()
  @IsString()
  seoDescription?: string;
}
