import { Body, Controller, Param, Patch, UseGuards } from '@nestjs/common';
import type { AppointmentDto } from '@altiora/shared-types';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { RequirePermission } from '../../../common/decorators/require-permission.decorator';
import { AppointmentsService } from '../application/appointments.service';
import { ConfirmAppointmentDto } from '../application/dto/confirm-appointment.dto';

/** Confirmar/cancelar es siempre acción humana desde el admin — nunca automática. */
@Controller('admin/appointments')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermission('leads', 'manage')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Patch(':id/confirm')
  confirm(@Param('id') id: string, @Body() dto: ConfirmAppointmentDto): Promise<AppointmentDto> {
    return this.appointmentsService.confirm(id, dto.agentId, new Date(dto.confirmedAt));
  }

  @Patch(':id/cancel')
  cancel(@Param('id') id: string): Promise<AppointmentDto> {
    return this.appointmentsService.cancel(id);
  }
}
