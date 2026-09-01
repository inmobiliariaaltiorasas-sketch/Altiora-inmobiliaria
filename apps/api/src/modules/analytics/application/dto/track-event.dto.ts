import { IsIn, IsObject, IsOptional, IsString } from 'class-validator';
import { CLIENT_ANALYTICS_EVENT_TYPES, type ClientAnalyticsEventType } from '@altiora/shared-types';

export class TrackEventDto {
  @IsIn(CLIENT_ANALYTICS_EVENT_TYPES)
  type!: ClientAnalyticsEventType;

  @IsString()
  sessionId!: string;

  @IsOptional()
  @IsString()
  propertyId?: string;

  @IsOptional()
  @IsObject()
  payload?: Record<string, unknown>;
}
