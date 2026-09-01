import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import type { PermissionsRepository } from '../domain/permissions.repository';
import type { PermissionRecord } from '../domain/permission-record';

@Injectable()
export class PrismaPermissionsRepository implements PermissionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<PermissionRecord[]> {
    const permissions = await this.prisma.permission.findMany({ orderBy: { resource: 'asc' } });
    return permissions.map((p) => ({ id: p.id, resource: p.resource, action: p.action }));
  }
}
