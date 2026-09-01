export const APPOINTMENT_TYPES = ['VISIT', 'CALL'] as const;
export type AppointmentType = (typeof APPOINTMENT_TYPES)[number];

export const APPOINTMENT_STATUSES = ['PROPOSED', 'CONFIRMED', 'CANCELLED', 'COMPLETED'] as const;
export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number];

export interface AppointmentDto {
  id: string;
  propertyId: string;
  propertyTitle: string;
  type: AppointmentType;
  status: AppointmentStatus;
  proposedAt: string;
  confirmedAt: string | null;
  proposedBySystem: boolean;
  agentName: string | null;
}

/** Confirmación real la hace un humano desde el admin — el sistema nunca auto-confirma. */
export interface ConfirmAppointmentDto {
  agentId: string;
  confirmedAt: string;
}

export interface CancelAppointmentDto {
  reason?: string;
}
