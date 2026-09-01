import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import {
  CURRENCIES,
  OPERATION_TYPES,
  type Currency,
  type OperationType,
} from '@altiora/shared-types';
import { PropertyTranslationDto } from './property-translation.dto';

export class UpdatePropertyDto {
  @IsOptional()
  @IsIn(OPERATION_TYPES)
  operationType?: OperationType;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsIn(CURRENCIES)
  currency?: Currency;

  @IsOptional()
  @IsInt()
  @Min(0)
  bedrooms?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  bathrooms?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  parkingSpots?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  builtAreaM2?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  landAreaM2?: number;

  @IsOptional()
  @IsInt()
  yearBuilt?: number;

  @IsOptional()
  @IsString()
  addressLine?: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsString()
  cityId?: string;

  @IsOptional()
  @IsString()
  neighborhoodId?: string;

  @IsOptional()
  @IsString()
  propertyTypeId?: string;

  @IsOptional()
  @IsString()
  agentId?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  featureIds?: string[];

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => PropertyTranslationDto)
  translations?: PropertyTranslationDto[];
}
