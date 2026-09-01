import { Inject, Injectable } from '@nestjs/common';
import {
  PERMISSIONS_REPOSITORY,
  type PermissionsRepository,
} from '../domain/permissions.repository';
import type { PermissionRecord } from '../domain/permission-record';

@Injectable()
export class PermissionsService {
  constructor(
    @Inject(PERMISSIONS_REPOSITORY) private readonly permissionsRepository: PermissionsRepository,
  ) {}

  findAll(): Promise<PermissionRecord[]> {
    return this.permissionsRepository.findAll();
  }
}
