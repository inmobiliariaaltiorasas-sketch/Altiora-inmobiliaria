import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import type { ContactsRepository, CreateContactInput } from '../domain/contacts.repository';
import type { ContactRecord } from '../domain/contact-record';

@Injectable()
export class PrismaContactsRepository implements ContactsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(input: CreateContactInput): Promise<ContactRecord> {
    return this.prisma.contact.create({ data: input });
  }

  findById(id: string): Promise<ContactRecord | null> {
    return this.prisma.contact.findUnique({ where: { id } });
  }
}
