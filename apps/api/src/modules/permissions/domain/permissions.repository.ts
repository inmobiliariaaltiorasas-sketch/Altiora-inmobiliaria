import type { PermissionRecord } from './permission-record';

export const PERMISSIONS_REPOSITORY = Symbol('PERMISSIONS_REPOSITORY');

export interface PermissionsRepository {
  findAll(): Promise<PermissionRecord[]>;
}
