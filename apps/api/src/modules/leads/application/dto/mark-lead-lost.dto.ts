import { IsIn } from 'class-validator';
import { LEAD_LOST_REASONS, type LeadLostReason } from '@altiora/shared-types';

export class MarkLeadLostDto {
  @IsIn(LEAD_LOST_REASONS)
  reason!: LeadLostReason;
}
