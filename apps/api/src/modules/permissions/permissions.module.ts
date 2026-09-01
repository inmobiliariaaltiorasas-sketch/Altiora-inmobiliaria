import { Module } from '@nestjs/common';
import { PermissionsService } from './application/permissions.service';
import { PermissionsController } from './infrastructure/permissions.controller';
import { PrismaPermissionsRepository } from './infrastructure/prisma-permissions.repository';
import { PERMISSIONS_REPOSITORY } from './domain/permissions.repository';

@Module({
  controllers: [PermissionsController],
  providers: [
    PermissionsService,
    { provide: PERMISSIONS_REPOSITORY, useClass: PrismaPermissionsRepository },
  ],
  exports: [PermissionsService],
})
export class PermissionsModule {}
