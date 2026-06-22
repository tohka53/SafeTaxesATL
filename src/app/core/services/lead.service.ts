import { Injectable } from '@angular/core';

import { SupabaseService } from './supabase.service';
import { Lead } from '@core/models/lead.model';
import { TaxForm } from '@core/models/tax-form.model';
import {
  IntakeValue,
  intakeToLead,
  intakeKeyFields,
  dynamicKeyFields
} from '@core/models/intake.util';

@Injectable({ providedIn: 'root' })
export class LeadService {
  private readonly table = 'leads';

  constructor(private readonly sb: SupabaseService) {}

  /** Public landing submission → prospect row (anonymous insert allowed by RLS). */
  async createFromTaxForm(form: Partial<TaxForm>): Promise<Lead> {
    const lead: Lead = {
      tax_year: form.tax_year ?? null,
      full_name: form.full_name ?? null,
      email: form.email ?? null,
      phone: form.phone ?? null,
      address_line1: form.address_line1 ?? null,
      city: form.city ?? null,
      state: form.state ?? null,
      zip: form.zip ?? null,
      ssn: form.ssn ?? null,
      bank_name: form.bank_name ?? null,
      bank_account_number: form.bank_account_number ?? null,
      bank_routing_number: form.bank_routing_number ?? null,
      employer: form.employer ?? null,
      income_range: form.income_range ?? null,
      filing_status: form.filing_status ?? null,
      dependents: form.dependents ?? null,
      notes: form.notes ?? null,
      source: 'landing',
      status: 'new'
    };
    const { data, error } = await this.sb.client
      .from(this.table)
      .insert(lead)
      .select('*')
      .single();
    if (error) {
      throw error;
    }
    return data as Lead;
  }

  /** Public landing submission of the full Client Profile form. */
  async createFromIntake(raw: IntakeValue): Promise<Lead> {
    const { data, error } = await this.sb.client
      .from(this.table)
      .insert(intakeToLead(raw))
      .select('*')
      .single();
    if (error) {
      throw error;
    }
    return data as Lead;
  }

  /** Public submission of any form type → prospect row with form_type + snapshot. */
  async createForType(formType: string, raw: IntakeValue): Promise<Lead> {
    const k: Record<string, any> =
      formType === 'client_profile' ? intakeKeyFields(raw) : dynamicKeyFields(raw);
    const lead: Lead = {
      tax_year: k['tax_year'] ?? null,
      full_name: k['full_name'] ?? null,
      email: k['email'] ?? null,
      phone: k['phone'] ?? null,
      address_line1: k['address_line1'] ?? null,
      city: k['city'] ?? null,
      state: k['state'] ?? null,
      zip: k['zip'] ?? null,
      ssn: k['ssn'] ?? null,
      bank_name: k['bank_name'] ?? null,
      bank_account_number: k['bank_account_number'] ?? null,
      bank_routing_number: k['bank_routing_number'] ?? null,
      employer: k['employer'] ?? null,
      income_range: null,
      filing_status: k['filing_status'] ?? null,
      dependents: k['dependents'] ?? null,
      notes: null,
      form_type: formType,
      extra: raw,
      source: 'landing',
      status: 'new'
    };
    const { data, error } = await this.sb.client
      .from(this.table)
      .insert(lead)
      .select('*')
      .single();
    if (error) {
      throw error;
    }
    return data as Lead;
  }

  /** Staff-only (RLS): list incoming prospects. */
  async list(): Promise<Lead[]> {
    const { data, error } = await this.sb.client
      .from(this.table)
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      throw error;
    }
    return (data ?? []) as Lead[];
  }
}
