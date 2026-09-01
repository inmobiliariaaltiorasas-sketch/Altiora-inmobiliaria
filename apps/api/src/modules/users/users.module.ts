import { Module } from '@nestjs/common';
import { UsersService } from './application/users.service';
import { UsersController } from './infrastructure/users.controller';
import { PrismaUsersRepository } from './infrastructure/prisma-users.repository';
import { USERS_REPOSITORY } from './domain/users.repository';

@Module({
  controllers: [UsersController],
  providers: [UsersService, { provide: USERS_REPOSITORY, useClass: PrismaUsersRepository }],
  exports: [UsersService],
})
export class UsersModule {}
