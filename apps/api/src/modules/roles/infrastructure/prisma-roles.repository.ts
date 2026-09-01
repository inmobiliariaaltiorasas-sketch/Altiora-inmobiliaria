import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import type { RolesRepository } from '../domain/roles.repository';
import type { RoleRecord } from '../domain/role-record';

@Injectable()
export class PrismaRolesRepository implements RolesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<RoleRecord[]> {
    const roles = await this.prisma.role.findMany({
      include: { permissions: { include: { permission: true } } },
      orderBy: { name: 'asc' },
    });

    return roles.map((role) => ({
      id: role.id,
      name: role.name,
      description: role.description,
      permissions: role.permissions.map(
        (rp) => `${rp.permission.resource}:${rp.permission.action}`,
      ),
    }));
  }
}
