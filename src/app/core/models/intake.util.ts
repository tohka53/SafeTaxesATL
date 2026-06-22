import { FormStatus, TaxForm, TaxProcessStatus } from './tax-form.model';
import { Lead } from './lead.model';

/** Raw value object produced by the comprehensive Client Profile form. */
export type IntakeValue = Record<string, any>;

/** Map the rich intake value to the flat key columns shared by tax_forms / leads. */
export function intakeKeyFields(raw: IntakeValue): Partial<TaxForm> {
  const tp = (raw?.['taxpayer'] ?? {}) as Record<string, any>;
  const deps = Array.isArray(raw?.['dependents']) ? raw['dependents'] : [];
  return {
    tax_year: Number(raw?.['tax_year']) || new Date().getFullYear(),
    full_name: [tp['first'], tp['last']].filter(Boolean).join(' ') || null,
    email: tp['email'] || null,
    phone: tp['cell'] || null,
    address_line1: tp['addr'] || null,
    city: tp['city'] || null,
    state: tp['state'] || null,
    zip: tp['zip'] || null,
    ssn: tp['ssn'] || null,
    bank_name: raw?.['bank_name'] || null,
    bank_account_number: raw?.['bank_acct'] || null,
    bank_routing_number: raw?.['bank_rout'] || null,
    employer: tp['occ'] || null,
    income_range: null,
    filing_status: raw?.['filing'] || null,
    dependents: deps.filter((d: any) => d && d.name).length || 0,
    notes: null
  };
}

/** Build a full TaxForm row (key columns + the entire raw form in `extra`). */
export function intakeToTaxForm(
  raw: IntakeValue,
  opts: {
    id?: string;
    userId: string;
    status: FormStatus;
    processStatus?: TaxProcessStatus;
    formType?: string;
  }
): TaxForm {
  return {
    ...(intakeKeyFields(raw) as TaxForm),
    id: opts.id,
    user_id: opts.userId,
    form_type: opts.formType ?? 'client_profile',
    status: opts.status,
    process_status: opts.processStatus ?? TaxProcessStatus.Received,
    extra: raw
  };
}

/** Key columns for a flat (dynamic) form definition. */
export function dynamicKeyFields(raw: IntakeValue): Partial<TaxForm> {
  return {
    tax_year: Number(raw?.['taxYear'] ?? raw?.['tax_year']) || new Date().getFullYear(),
    full_name:
      raw?.['client'] ||
      raw?.['clientName'] ||
      [raw?.['firstName'], raw?.['lastName']].filter(Boolean).join(' ') ||
      raw?.['businessName'] ||
      raw?.['contactName'] ||
      null,
    email: raw?.['email'] || raw?.['bizEmail'] || null,
    phone: raw?.['cellPhone'] || raw?.['bizPhone'] || raw?.['contactPhone'] || null,
    bank_name: raw?.['bankName'] ?? null,
    bank_account_number: raw?.['accountNumber'] ?? null,
    bank_routing_number: raw?.['rtn'] ?? null
  };
}

/** Build a TaxForm row from a flat (dynamic) form value. */
export function dynamicToTaxForm(
  raw: IntakeValue,
  opts: {
    id?: string;
    userId: string;
    status: FormStatus;
    processStatus?: TaxProcessStatus;
    formType: string;
  }
): TaxForm {
  return {
    ...(dynamicKeyFields(raw) as TaxForm),
    id: opts.id,
    user_id: opts.userId,
    form_type: opts.formType,
    status: opts.status,
    process_status: opts.processStatus ?? TaxProcessStatus.Received,
    extra: raw
  };
}

/** Build a Lead row from a public submission (key columns + raw in `extra`). */
export function intakeToLead(raw: IntakeValue): Lead {
  const k = intakeKeyFields(raw);
  return {
    tax_year: k.tax_year ?? null,
    full_name: k.full_name ?? null,
    email: k.email ?? null,
    phone: k.phone ?? null,
    address_line1: k.address_line1 ?? null,
    city: k.city ?? null,
    state: k.state ?? null,
    zip: k.zip ?? null,
    ssn: k.ssn ?? null,
    bank_name: k.bank_name ?? null,
    bank_account_number: k.bank_account_number ?? null,
    bank_routing_number: k.bank_routing_number ?? null,
    employer: k.employer ?? null,
    income_range: null,
    filing_status: k.filing_status ?? null,
    dependents: k.dependents ?? null,
    notes: null,
    source: 'landing',
    status: 'new',
    extra: raw
  };
}
