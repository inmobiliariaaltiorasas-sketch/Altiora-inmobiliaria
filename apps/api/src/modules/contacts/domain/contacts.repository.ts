import type { PreferredChannel } from '@altiora/shared-types';
import type { ContactRecord } from './contact-record';

export const CONTACTS_REPOSITORY = Symbol('CONTACTS_REPOSITORY');

export interface CreateContactInput {
  name: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  preferredChannel: PreferredChannel;
  sessionId?: string;
}

export interface ContactsRepository {
  create(input: CreateContactInput): Promise<ContactRecord>;
  findById(id: string): Promise<ContactRecord | null>;
}
