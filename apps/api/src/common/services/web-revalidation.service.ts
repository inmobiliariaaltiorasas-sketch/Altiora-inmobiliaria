import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * NestJS es dueño de los datos; Next.js cachea páginas públicas con ISR. Cuando el admin cambia
 * precio/disponibilidad, este servicio pide a Next.js que invalide la página afectada (v1 sección
 * 06 y corrección 22). Best-effort: si `apps/web` no está levantada, no debe romper la mutación.
 */
@Injectable()
export class WebRevalidationService {
  private readonly logger = new Logger(WebRevalidationService.name);

  constructor(private readonly configService: ConfigService) {}

  async revalidateProperty(slug: string): Promise<void> {
    // '' revalida la Home (/es-CO, /en-US) — ahí vive "Propiedades destacadas", que también
    // cambia con cualquier publish/archive/feature toggle, no solo con la ficha individual.
    await this.post(['', '/propiedades/' + slug, '/propiedades']);
  }

  async revalidateBlogPost(slug: string): Promise<void> {
    await this.post(['/blog/' + slug, '/blog']);
  }

  private async post(paths: string[]): Promise<void> {
    const webUrl = this.configService.get<string>('WEB_APP_URL', 'http://localhost:3000');
    const secret = this.configService.get<string>('REVALIDATE_SECRET', 'dev-revalidate-secret');

    try {
      const response = await fetch(`${webUrl}/api/revalidate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-revalidate-secret': secret },
        body: JSON.stringify({ paths }),
      });
      if (!response.ok) {
        this.logger.warn(`Revalidación respondió ${response.status} para ${paths.join(', ')}`);
      }
    } catch (error) {
      this.logger.warn(`No se pudo revalidar ${paths.join(', ')}: ${(error as Error).message}`);
    }
  }
}
