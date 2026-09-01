import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { RequirePermission } from '../../../common/decorators/require-permission.decorator';
import { SettingsService } from '../application/settings.service';
import { UpdateFxRateDto } from '../application/dto/update-fx-rate.dto';

@Controller()
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  /** Público — el sitio la necesita para mostrar el estimado en USD en locale en-US. */
  @Get('settings/fx-rate-usd-cop')
  getFxRate(): Promise<{ rate: number }> {
    return this.settingsService.getFxRateUsdCop().then((rate) => ({ rate }));
  }

  @Put('admin/settings/fx-rate-usd-cop')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('settings', 'manage')
  setFxRate(@Body() dto: UpdateFxRateDto): Promise<{ rate: number }> {
    return this.settingsService.setFxRateUsdCop(dto.rate).then((rate) => ({ rate }));
  }
}
