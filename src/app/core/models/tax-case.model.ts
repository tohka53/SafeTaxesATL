export type CaseStatus = 'started' | 'in_process' | 'finished';

export const CASE_STATUSES: CaseStatus[] = ['started', 'in_process', 'finished'];

/** Documents / data the staff can request from a client. */
export const REQUEST_ITEMS: string[] = [
  'w2',
  'f1099',
  'id',
  'ssn_card',
  'f1095',
  'bank',
  'dependents',
  'income_proof',
  'prior_return',
  'intake_form',
  'other'
];

/** The per-client/per-year tax process the staff drives and the client views. */
export interface TaxCase {
  id?: string;
  user_id: string;
  tax_year: number;
  status: CaseStatus;
  requested: string[] | null;
  request_note: string | null;
  started_at?: string;
  updated_at?: string;
  created_by?: string | null;
}
