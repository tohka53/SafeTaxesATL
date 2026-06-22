import { UserRole } from './user-role.enum';

export type IncomeRange =
  | 'lt_25k'
  | '25k_50k'
  | '50k_75k'
  | '75k_100k'
  | '100k_150k'
  | 'gt_150k';

export const INCOME_RANGES: IncomeRange[] = [
  'lt_25k',
  '25k_50k',
  '50k_75k',
  '75k_100k',
  '100k_150k',
  'gt_150k'
];

/**
 * A user profile. `id` equals the Supabase auth user id.
 * Fields marked "sensitive" are PII (SSN / US bank details) and are protected
 * by Row Level Security — see supabase/schema.sql for encryption guidance.
 */
export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  ssn: string | null; // sensitive
  bank_name: string | null;
  bank_account_number: string | null; // sensitive
  bank_routing_number: string | null; // sensitive
  employer: string | null;
  income_range: IncomeRange | null;
  role: UserRole;
  created_at?: string;
  updated_at?: string;
}
