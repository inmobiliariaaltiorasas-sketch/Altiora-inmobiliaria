import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import type { AuthTokensDto } from '@altiora/shared-types';
import { AuthService } from '../application/auth.service';
import { LoginDto } from '../application/dto/login.dto';
import { RefreshDto } from '../application/dto/refresh.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto): Promise<AuthTokensDto> {
    const user = await this.authService.validateCredentials(dto.email, dto.password);
    return this.authService.issueTokens(user);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refresh(@Body() dto: RefreshDto): Promise<AuthTokensDto> {
    return this.authService.refresh(dto.refreshToken);
  }
}
