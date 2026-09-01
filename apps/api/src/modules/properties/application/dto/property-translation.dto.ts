import { IsIn, IsOptional, IsString, MinLength } from 'class-validator';
import { SUPPORTED_LOCALES, type SupportedLocale } from '@altiora/shared-types';

export class PropertyTranslationDto {
  @IsIn(SUPPORTED_LOCALES)
  locale!: SupportedLocale;

  @IsString()
  @MinLength(3)
  title!: string;

  @IsOptional()
  @IsString()
  subtitle?: string;

  @IsString()
  @MinLength(10)
  shortDescription!: string;

  @IsString()
  @MinLength(20)
  fullDescription!: string;

  @IsOptional()
  @IsString()
  seoTitle?: string;

  @IsOptional()
  @IsString()
  seoDescription?: string;

  @IsOptional()
  @IsString()
  seoCanonicalOverride?: string;
}
