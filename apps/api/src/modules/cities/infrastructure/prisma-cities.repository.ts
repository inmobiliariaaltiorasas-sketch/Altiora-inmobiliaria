import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import type { CitiesRepository, CreateCityInput } from '../domain/cities.repository';
import type { CityRecord } from '../domain/city-record';

@Injectable()
export class PrismaCitiesRepository implements CitiesRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAllActive(): Promise<CityRecord[]> {
    return this.prisma.city.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } });
  }

  findBySlug(slug: string): Promise<CityRecord | null> {
    return this.prisma.city.findUnique({ where: { slug } });
  }

  findById(id: string): Promise<CityRecord | null> {
    return this.prisma.city.findUnique({ where: { id } });
  }

  create(input: CreateCityInput): Promise<CityRecord> {
    return this.prisma.city.create({
      data: { ...input, country: input.country ?? 'Colombia' },
    });
  }
}
