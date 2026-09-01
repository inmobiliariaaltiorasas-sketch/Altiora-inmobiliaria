import { Inject, Injectable } from '@nestjs/common';
import type { AuthenticatedUserDto } from '@altiora/shared-types';
import { USERS_REPOSITORY, type UsersRepository } from '../domain/users.repository';
import type { UserRecord } from '../domain/user-record';

@Injectable()
export class UsersService {
  constructor(@Inject(USERS_REPOSITORY) private readonly usersRepository: UsersRepository) {}

  findByEmail(email: string): Promise<UserRecord | null> {
    return this.usersRepository.findByEmail(email);
  }

  findRecordById(id: string): Promise<UserRecord | null> {
    return this.usersRepository.findById(id);
  }

  async findByIdOrThrow(id: string): Promise<AuthenticatedUserDto> {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new Error(`Usuario no encontrado: ${id}`);
    }
    return { id: user.id, email: user.email, name: user.name, roleName: user.role.name };
  }
}
