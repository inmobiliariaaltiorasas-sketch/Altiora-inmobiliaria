import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import type { PropertyFeaturesRepository } from '../domain/property-features.repository';
import type { PropertyFeatureRecord } from '../domain/property-feature-record';

@Injectable()
export class PrismaPropertyFeaturesRepository implements PropertyFeaturesRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(): Promise<PropertyFeatureRecord[]> {
    return this.prisma.propertyFeature.findMany({ orderBy: { name: 'asc' } });
  }

  findByIds(ids: string[]): Promise<PropertyFeatureRecord[]> {
    return this.prisma.propertyFeature.findMany({ where: { id: { in: ids } } });
  }

  create(input: { name: string; slug: string }): Promise<PropertyFeatureRecord> {
    return this.prisma.propertyFeature.create({ data: input });
  }
}
