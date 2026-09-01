import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import type { UsersRepository } from '../domain/users.repository';
import type { UserRecord } from '../domain/user-record';

@Injectable()
export class PrismaUsersRepository implements UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<UserRecord | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { role: { include: { permissions: { include: { permission: true } } } } },
    });
    return user ? this.toRecord(user) : null;
  }

  async findById(id: string): Promise<UserRecord | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { role: { include: { permissions: { include: { permission: true } } } } },
    });
    return user ? this.toRecord(user) : null;
  }

  private toRecord(user: {
    id: string;
    email: string;
    name: string;
    passwordHash: string;
    isActive: boolean;
    role: {
      id: string;
      name: string;
      permissions: Array<{ permission: { resource: string; action: string } }>;
    };
  }): UserRecord {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      passwordHash: user.passwordHash,
      isActive: user.isActive,
      role: {
        id: user.role.id,
        name: user.role.name,
        permissions: user.role.permissions.map(
          (rp) => `${rp.permission.resource}:${rp.permission.action}`,
        ),
      },
    };
  }
}
