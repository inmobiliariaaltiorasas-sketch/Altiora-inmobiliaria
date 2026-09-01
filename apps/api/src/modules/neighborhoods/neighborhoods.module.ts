import { Module } from '@nestjs/common';
import { NeighborhoodsService } from './application/neighborhoods.service';
import { NeighborhoodsController } from './infrastructure/neighborhoods.controller';
import { PrismaNeighborhoodsRepository } from './infrastructure/prisma-neighborhoods.repository';
import { NEIGHBORHOODS_REPOSITORY } from './domain/neighborhoods.repository';

@Module({
  controllers: [NeighborhoodsController],
  providers: [
    NeighborhoodsService,
    { provide: NEIGHBORHOODS_REPOSITORY, useClass: PrismaNeighborhoodsRepository },
  ],
  exports: [NeighborhoodsService],
})
export class NeighborhoodsModule {}
