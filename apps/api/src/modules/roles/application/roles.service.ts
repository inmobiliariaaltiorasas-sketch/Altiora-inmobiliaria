import { Inject, Injectable } from '@nestjs/common';
import { ROLES_REPOSITORY, type RolesRepository } from '../domain/roles.repository';
import type { RoleRecord } from '../domain/role-record';

@Injectable()
export class RolesService {
  constructor(@Inject(ROLES_REPOSITORY) private readonly rolesRepository: RolesRepository) {}

  findAll(): Promise<RoleRecord[]> {
    return this.rolesRepository.findAll();
  }
}
