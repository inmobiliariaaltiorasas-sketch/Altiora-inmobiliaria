import { Inject, Injectable } from '@nestjs/common';
import {
  CONTACTS_REPOSITORY,
  type ContactsRepository,
  type CreateContactInput,
} from '../domain/contacts.repository';
import type { ContactRecord } from '../domain/contact-record';

@Injectable()
export class ContactsService {
  constructor(@Inject(CONTACTS_REPOSITORY) private readonly repository: ContactsRepository) {}

  create(input: CreateContactInput): Promise<ContactRecord> {
    return this.repository.create(input);
  }
}
