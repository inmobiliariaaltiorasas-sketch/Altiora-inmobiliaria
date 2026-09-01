import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import type {
  CreateNeighborhoodInput,
  NeighborhoodsRepository,
} from '../domain/neighborhoods.repository';
import type { NeighborhoodRecord } from '../domain/neighborhood-record';

@Injectable()
export class PrismaNeighborhoodsRepository implements NeighborhoodsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByCityId(cityId: string): Promise<NeighborhoodRecord[]> {
    return this.prisma.neighborhood.findMany({ where: { cityId }, orderBy: { name: 'asc' } });
  }

  findBySlugInCity(cityId: string, slug: string): Promise<NeighborhoodRecord | null> {
    return this.prisma.neighborhood.findUnique({ where: { cityId_slug: { cityId, slug } } });
  }

  findById(id: string): Promise<NeighborhoodRecord | null> {
    return this.prisma.neighborhood.findUnique({ where: { id } });
  }

  create(input: CreateNeighborhoodInput): Promise<NeighborhoodRecord> {
    return this.prisma.neighborhood.create({ data: input });
  }
}
