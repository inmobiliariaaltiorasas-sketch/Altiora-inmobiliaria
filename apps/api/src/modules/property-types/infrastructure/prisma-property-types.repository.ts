import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import type { PropertyTypesRepository } from '../domain/property-types.repository';
import type { PropertyTypeRecord } from '../domain/property-type-record';

@Injectable()
export class PrismaPropertyTypesRepository implements PropertyTypesRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(): Promise<PropertyTypeRecord[]> {
    return this.prisma.propertyType.findMany({ orderBy: { name: 'asc' } });
  }

  findBySlug(slug: string): Promise<PropertyTypeRecord | null> {
    return this.prisma.propertyType.findUnique({ where: { slug } });
  }

  findById(id: string): Promise<PropertyTypeRecord | null> {
    return this.prisma.propertyType.findUnique({ where: { id } });
  }

  create(input: { name: string; slug: string }): Promise<PropertyTypeRecord> {
    return this.prisma.propertyType.create({ data: input });
  }
}
