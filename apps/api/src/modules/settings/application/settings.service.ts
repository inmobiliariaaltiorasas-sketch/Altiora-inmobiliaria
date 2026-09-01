import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';

/** Tasa de referencia por defecto si el admin todavía no cargó una — puramente informativa. */
const DEFAULT_FX_RATE_USD_COP = 4000;

/**
 * Key/value simple — no hace falta más estructura que la que Fase 4 necesita
 * (v1 corrección sección 3: conversión de moneda manual, sin API externa).
 */
@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getFxRateUsdCop(): Promise<number> {
    const setting = await this.prisma.setting.findUnique({ where: { key: 'fxRateUsdCop' } });
    return setting ? Number(setting.value) : DEFAULT_FX_RATE_USD_COP;
  }

  async setFxRateUsdCop(rate: number): Promise<number> {
    await this.prisma.setting.upsert({
      where: { key: 'fxRateUsdCop' },
      create: { key: 'fxRateUsdCop', value: String(rate) },
      update: { value: String(rate) },
    });
    return rate;
  }
}
