import { IsIn, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { LEAD_FUNNEL_STAGES, type LeadFunnelStage } from '@altiora/shared-types';

export class UpdateLeadDto {
  @IsOptional()
  @IsIn(LEAD_FUNNEL_STAGES)
  funnelStage?: LeadFunnelStage;

  @IsOptional()
  @IsString()
  assignedAgentId?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  budget?: number;
}
