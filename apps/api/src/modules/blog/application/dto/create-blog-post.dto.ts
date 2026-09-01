import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { BlogTranslationDto } from './blog-translation.dto';

export class CreateBlogPostDto {
  @IsOptional()
  @IsString()
  cityId?: string;

  @IsOptional()
  @IsBoolean()
  needsReview?: boolean;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => BlogTranslationDto)
  translations!: BlogTranslationDto[];
}
