import type { RoleRecord } from './role-record';

export const ROLES_REPOSITORY = Symbol('ROLES_REPOSITORY');

export interface RolesRepository {
  findAll(): Promise<RoleRecord[]>;
}
