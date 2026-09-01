import { IsIn, IsISO8601, IsString } from 'class-validator';
import { APPOINTMENT_TYPES, type AppointmentType } from '@altiora/shared-types';

/** Un asesor propone la cita desde el admin — siempre queda en PROPOSED (v1 sección 5). */
export class ProposeAppointmentDto {
  @IsString()
  propertyId!: string;

  @IsIn(APPOINTMENT_TYPES)
  type!: AppointmentType;

  @IsISO8601()
  proposedAt!: string;
}
