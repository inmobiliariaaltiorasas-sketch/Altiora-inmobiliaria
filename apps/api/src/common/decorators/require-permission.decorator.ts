import { SetMetadata } from '@nestjs/common';

export const PERMISSION_KEY = 'permission';

/** "resource:action" — ver PermissionsGuard, que lo compara contra JwtPayload.permissions. */
export const RequirePermission = (resource: string, action: string) =>
  SetMetadata(PERMISSION_KEY, `${resource}:${action}`);
