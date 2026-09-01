import { IsIn, IsOptional, IsString, MinLength } from 'class-validator';
import {
  INQUIRY_TYPES,
  PREFERRED_CHANNELS,
  type InquiryType,
  type PreferredChannel,
} from '@altiora/shared-types';

/** Deliberadamente mínimo: nombre + un canal de contacto — v1 corrección sección 7. */
export class CreateInquiryDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsOptional()
  @IsString()
  whatsapp?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsIn(PREFERRED_CHANNELS)
  preferredChannel!: PreferredChannel;

  @IsIn(INQUIRY_TYPES)
  inquiryType!: InquiryType;

  @IsOptional()
  @IsString()
  propertyId?: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsString()
  sessionId!: string;
}
