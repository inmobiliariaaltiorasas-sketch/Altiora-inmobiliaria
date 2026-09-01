import { Module } from '@nestjs/common';
import { BlogService } from './application/blog.service';
import { BlogController } from './infrastructure/blog.controller';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { WebRevalidationService } from '../../common/services/web-revalidation.service';

@Module({
  imports: [AuditLogsModule],
  controllers: [BlogController],
  providers: [BlogService, WebRevalidationService],
  exports: [BlogService],
})
export class BlogModule {}
