import { IsNumber, Min } from 'class-validator';

export class UpdateFxRateDto {
  @IsNumber()
  @Min(1)
  rate!: number;
}
