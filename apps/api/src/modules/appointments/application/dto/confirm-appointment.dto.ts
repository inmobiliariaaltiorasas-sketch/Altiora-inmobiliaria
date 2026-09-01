import { IsISO8601, IsString } from 'class-validator';

export class ConfirmAppointmentDto {
  @IsString()
  agentId!: string;

  @IsISO8601()
  confirmedAt!: string;
}
