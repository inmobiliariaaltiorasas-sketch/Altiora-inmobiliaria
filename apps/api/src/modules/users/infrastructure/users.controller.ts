import { Controller, Get, UseGuards } from '@nestjs/common';
import type { AuthenticatedUserDto, JwtPayload } from '@altiora/shared-types';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { UsersService } from '../application/users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@CurrentUser() user: JwtPayload): Promise<AuthenticatedUserDto> {
    return this.usersService.findByIdOrThrow(user.sub);
  }
}
