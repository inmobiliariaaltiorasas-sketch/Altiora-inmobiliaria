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

export class CreatePropertyDto {
  @IsIn(OPERATION_TYPES)
  operationType!: OperationType;

  @IsNumber()
  @Min(0)
  price!: number;

  @IsOptional()
  @IsIn(CURRENCIES)
  currency?: Currency;

  @IsInt()
  @Min(0)
  bedrooms!: number;

  @IsInt()
  @Min(0)
  bathrooms!: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  parkingSpots?: number;

  @IsNumber()
  @Min(0)
  builtAreaM2!: number;

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

  @IsString()
  cityId!: string;

  @IsOptional()
  @IsString()
  neighborhoodId?: string;

  @IsString()
  propertyTypeId!: string;

  @IsOptional()
  @IsString()
  agentId?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  featureIds?: string[];

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => PropertyTranslationDto)
  translations!: PropertyTranslationDto[];
}
