export type TemplateType = 'email' | 'sms';

/** A predefined email/SMS message the staff can reuse. */
export interface MessageTemplate {
  id?: string;
  name: string;
  type: TemplateType;
  subject: string | null;
  body: string | null;
  created_by?: string | null;
  created_at?: string;
  updated_at?: string;
}
