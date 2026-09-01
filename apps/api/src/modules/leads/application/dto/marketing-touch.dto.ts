import { IsOptional, IsString } from 'class-validator';

export class MarketingTouchDto {
  @IsString()
  sessionId!: string;

  @IsOptional()
  @IsString()
  utmSource?: string;

  @IsOptional()
  @IsString()
  utmMedium?: string;

  @IsOptional()
  @IsString()
  utmCampaign?: string;

  @IsOptional()
  @IsString()
  utmContent?: string;

  @IsOptional()
  @IsString()
  utmTerm?: string;

  @IsOptional()
  @IsString()
  gclid?: string;

  @IsOptional()
  @IsString()
  fbclid?: string;

  @IsOptional()
  @IsString()
  referrer?: string;

  @IsString()
  landingPage!: string;
}
