import { Controller, Get, Query } from '@nestjs/common';
import { DEFAULT_LOCALE, type FaqDto, type SupportedLocale } from '@altiora/shared-types';
import { FaqService } from '../application/faq.service';

@Controller('content')
export class ContentController {
  constructor(private readonly faqService: FaqService) {}

  /** Público — AEO: FAQs con respuesta ya resuelta, dinámicas o no (v1 sección 10). */
  @Get('faqs')
  getFaqs(
    @Query('citySlug') citySlug: string,
    @Query('locale') locale: SupportedLocale = DEFAULT_LOCALE,
  ): Promise<FaqDto[]> {
    return this.faqService.getFaqsForCity(citySlug, locale);
  }
}
