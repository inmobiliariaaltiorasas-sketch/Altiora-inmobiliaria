import { Module } from '@nestjs/common';
import { ContactsService } from './application/contacts.service';
import { PrismaContactsRepository } from './infrastructure/prisma-contacts.repository';
import { CONTACTS_REPOSITORY } from './domain/contacts.repository';

@Module({
  providers: [
    ContactsService,
    { provide: CONTACTS_REPOSITORY, useClass: PrismaContactsRepository },
  ],
  exports: [ContactsService],
})
export class ContactsModule {}
