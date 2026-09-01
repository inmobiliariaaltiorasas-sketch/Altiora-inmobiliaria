export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface AuthTokensDto {
  accessToken: string;
  refreshToken: string;
}

export interface RefreshRequestDto {
  refreshToken: string;
}

export interface JwtPayload {
  sub: string;
  email: string;
  roleId: string;
  roleName: string;
  /** "resource:action" — resuelto una vez al emitir el token, así el guard no golpea la DB en cada request. */
  permissions: string[];
}

export interface AuthenticatedUserDto {
  id: string;
  email: string;
  name: string;
  roleName: string;
}
