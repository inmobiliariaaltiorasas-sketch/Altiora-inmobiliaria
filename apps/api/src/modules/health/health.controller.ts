import { Controller, Get, HttpCode, HttpStatus, ServiceUnavailableException } from '@nestjs/common';
import type { HealthStatusDto } from '@altiora/shared-types';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async check(): Promise<HealthStatusDto> {
    const databaseUp = await this.prisma.isDatabaseUp();
    const status: HealthStatusDto = {
      status: databaseUp ? 'ok' : 'error',
      database: databaseUp ? 'up' : 'down',
      timestamp: new Date().toISOString(),
    };

    if (!databaseUp) {
      throw new ServiceUnavailableException(status);
    }

    return status;
  }
}
