import { Module } from '@nestjs/common';
import { FaqService } from './application/faq.service';
import { ContentController } from './infrastructure/content.controller';
import { CitiesModule } from '../cities/cities.module';

@Module({
  imports: [CitiesModule],
  controllers: [ContentController],
  providers: [FaqService],
  exports: [FaqService],
})
export class ContentModule {}
