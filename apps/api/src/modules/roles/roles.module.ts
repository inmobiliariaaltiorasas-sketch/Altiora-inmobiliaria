import { Module } from '@nestjs/common';
import { RolesService } from './application/roles.service';
import { RolesController } from './infrastructure/roles.controller';
import { PrismaRolesRepository } from './infrastructure/prisma-roles.repository';
import { ROLES_REPOSITORY } from './domain/roles.repository';

@Module({
  controllers: [RolesController],
  providers: [RolesService, { provide: ROLES_REPOSITORY, useClass: PrismaRolesRepository }],
  exports: [RolesService],
})
export class RolesModule {}
