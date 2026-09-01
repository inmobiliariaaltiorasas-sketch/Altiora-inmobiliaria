import { IsIn, IsOptional, IsString } from 'class-validator';
import {
  LEAD_FUNNEL_STAGES,
  LEAD_SOURCE_CHANNELS,
  type LeadFunnelStage,
  type LeadSourceChannel,
} from '@altiora/shared-types';

export class LeadFiltersQueryDto {
  @IsOptional()
  @IsIn(LEAD_FUNNEL_STAGES)
  stage?: LeadFunnelStage;

  @IsOptional()
  @IsIn(LEAD_SOURCE_CHANNELS)
  source?: LeadSourceChannel;

  @IsOptional()
  @IsString()
  agentId?: string;
}
