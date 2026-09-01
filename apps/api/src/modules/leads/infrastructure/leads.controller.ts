import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import type { LeadDetailDto, LeadSummaryDto } from '@altiora/shared-types';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { RequirePermission } from '../../../common/decorators/require-permission.decorator';
import { LeadsService } from '../application/leads.service';
import { CreateInquiryDto } from '../application/dto/create-inquiry.dto';
import { MarketingTouchDto } from '../application/dto/marketing-touch.dto';
import { UpdateLeadDto } from '../application/dto/update-lead.dto';
import { MarkLeadLostDto } from '../application/dto/mark-lead-lost.dto';
import { LeadFiltersQueryDto } from '../application/dto/lead-filters-query.dto';
import { ProposeAppointmentDto } from '../application/dto/propose-appointment.dto';

@Controller()
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  /** Público — captura de atribución en cada sesión pública (v1 corrección sección 12). */
  @Post('marketing-touches')
  @HttpCode(HttpStatus.ACCEPTED)
  recordTouch(@Body() dto: MarketingTouchDto): Promise<void> {
    return this.leadsService.recordMarketingTouch(dto);
  }

  /**
   * Público — mismo endpoint para el formulario de la ficha de propiedad y la página de
   * contacto general (v1 corrección sección 13: "sin propertyId obligatorio").
   */
  @Post('leads/inquiries')
  createInquiry(@Body() dto: CreateInquiryDto): Promise<{ leadId: string }> {
    return this.leadsService.createInquiry(dto);
  }

  @Get('admin/leads')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('leads', 'manage')
  findAll(@Query() filters: LeadFiltersQueryDto): Promise<LeadSummaryDto[]> {
    return this.leadsService.findAdminList(filters);
  }

  @Get('admin/leads/:id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('leads', 'manage')
  findOne(@Param('id') id: string): Promise<LeadDetailDto> {
    return this.leadsService.findAdminDetailOrThrow(id);
  }

  @Patch('admin/leads/:id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('leads', 'manage')
  update(@Param('id') id: string, @Body() dto: UpdateLeadDto): Promise<LeadDetailDto> {
    return this.leadsService.update(id, dto);
  }

  @Patch('admin/leads/:id/lost')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('leads', 'manage')
  markLost(@Param('id') id: string, @Body() dto: MarkLeadLostDto): Promise<LeadDetailDto> {
    return this.leadsService.markLost(id, dto);
  }

  /** Handoff manual bot→humano — el asesor toma la conversación aunque el bot no haya escalado. */
  @Patch('admin/leads/:id/handoff')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('leads', 'manage')
  handoff(@Param('id') id: string): Promise<LeadDetailDto> {
    return this.leadsService.handoffConversationToHuman(id);
  }

  /** Un asesor propone una cita manualmente — antes solo el agente IA podía hacerlo. */
  @Post('admin/leads/:id/appointments')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('leads', 'manage')
  proposeAppointment(
    @Param('id') id: string,
    @Body() dto: ProposeAppointmentDto,
  ): Promise<LeadDetailDto> {
    return this.leadsService.proposeAppointment(id, dto);
  }
}
