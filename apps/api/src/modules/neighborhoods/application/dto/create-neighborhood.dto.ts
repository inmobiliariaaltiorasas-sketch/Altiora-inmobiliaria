import { IsString, MinLength } from 'class-validator';

export class CreateNeighborhoodDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsString()
  @MinLength(2)
  slug!: string;

  @IsString()
  cityId!: string;
}
