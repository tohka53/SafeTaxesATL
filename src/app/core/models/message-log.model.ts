/** A record of a sent email/SMS, used to avoid duplicate sends. */
export interface MessageLog {
  id?: string;
  contact_id: string;
  channel: 'email' | 'sms';
  subject?: string | null;
  body?: string | null;
  sent_by?: string | null;
  sent_at?: string;
}
