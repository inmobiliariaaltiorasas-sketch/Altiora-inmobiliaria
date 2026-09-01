import { IsIn, IsNumber, IsOptional, Min } from 'class-validator';
import { CURRENCIES, type Currency } from '@altiora/shared-types';

export class UpdatePropertyPriceDto {
  @IsNumber()
  @Min(0)
  price!: number;

  @IsOptional()
  @IsIn(CURRENCIES)
  currency?: Currency;
}
