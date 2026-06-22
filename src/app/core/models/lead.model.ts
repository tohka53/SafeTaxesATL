export type LeadStatus = 'new' | 'contacted' | 'converted' | 'archived';

/**
 * A prospect captured from the PUBLIC landing form (no auth account yet).
 * Inserted anonymously (see leads RLS in supabase/schema.sql); only staff can read.
 */
export interface Lead {
  id?: string;
  tax_year: number | null;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  address_line1: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  ssn: string | null; // sensitive
  bank_name: string | null;
  bank_account_number: string | null; // sensitive
  bank_routing_number: string | null; // sensitive
  employer: string | null;
  income_range: string | null;
  filing_status: string | null;
  dependents: number | null;
  notes: string | null;
  /** Which form definition was submitted (client_profile, schedule_c, ...). */
  form_type?: string;
  /** Full form snapshot (jsonb). */
  extra?: Record<string, any> | null;
  source: string;
  status: LeadStatus;
  created_at?: string;
}
