export enum FormStatus {
  /** Editable by the client until submitted. */
  Draft = 'draft',
  Submitted = 'submitted'
}

/** Steps the client can follow in their tax process for a given year. */
export enum TaxProcessStatus {
  Received = 'received',
  InReview = 'in_review',
  Preparing = 'preparing',
  ReadyForReview = 'ready_for_review',
  Filed = 'filed',
  Completed = 'completed'
}

export const TAX_PROCESS_STEPS: TaxProcessStatus[] = [
  TaxProcessStatus.Received,
  TaxProcessStatus.InReview,
  TaxProcessStatus.Preparing,
  TaxProcessStatus.ReadyForReview,
  TaxProcessStatus.Filed,
  TaxProcessStatus.Completed
];

export type FilingStatus =
  | 'single'
  | 'married_joint'
  | 'married_separate'
  | 'head_of_household'
  | 'widow';

export const FILING_STATUSES: FilingStatus[] = [
  'single',
  'married_joint',
  'married_separate',
  'head_of_household',
  'widow'
];

/**
 * One tax intake form == the case for a client for a given tax year.
 * Carries a snapshot of the personal info captured at fill time so that a
 * filed return is not retro-changed when the profile changes later.
 */
export interface TaxForm {
  id?: string;
  user_id: string;
  tax_year: number;
  /** Which form definition this record is (client_profile, schedule_c, ...). */
  form_type?: string;
  status: FormStatus;
  process_status: TaxProcessStatus;

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
  filing_status: FilingStatus | null;
  dependents: number | null;
  notes: string | null;

  /** jsonb escape hatch for fields added later without a migration. */
  extra: Record<string, unknown> | null;

  created_at?: string;
  updated_at?: string;
  submitted_at?: string | null;
}
