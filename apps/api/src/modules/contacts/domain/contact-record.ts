import type { PreferredChannel } from '@altiora/shared-types';

export interface ContactRecord {
  id: string;
  name: string;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  preferredChannel: PreferredChannel;
  sessionId: string | null;
}
