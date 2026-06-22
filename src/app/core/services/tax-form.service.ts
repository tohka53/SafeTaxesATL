import { Injectable } from '@angular/core';

import { SupabaseService } from './supabase.service';
import {
  FormStatus,
  TaxForm,
  TaxProcessStatus
} from '@core/models/tax-form.model';

@Injectable({ providedIn: 'root' })
export class TaxFormService {
  private readonly table = 'tax_forms';

  constructor(private readonly sb: SupabaseService) {}

  async listByUser(userId: string): Promise<TaxForm[]> {
    const { data, error } = await this.sb.client
      .from(this.table)
      .select('*')
      .eq('user_id', userId)
      .order('tax_year', { ascending: false })
      .order('updated_at', { ascending: false });
    if (error) {
      throw error;
    }
    return (data ?? []) as TaxForm[];
  }

  /** Groups a client's forms by tax year (used for the "folders" view). */
  async listByUserGroupedByYear(
    userId: string
  ): Promise<Record<number, TaxForm[]>> {
    const forms = await this.listByUser(userId);
    return forms.reduce<Record<number, TaxForm[]>>((acc, f) => {
      (acc[f.tax_year] ??= []).push(f);
      return acc;
    }, {});
  }

  async getById(id: string): Promise<TaxForm | null> {
    const { data, error } = await this.sb.client
      .from(this.table)
      .select('*')
      .eq('id', id)
      .single();
    if (error) {
      console.warn('taxForm.getById', error.message);
      return null;
    }
    return data as TaxForm;
  }

  /** Insert or update. Returns the persisted row. */
  async save(form: TaxForm): Promise<TaxForm> {
    const payload: TaxForm = { ...form, updated_at: new Date().toISOString() };
    if (form.status === FormStatus.Submitted && !form.submitted_at) {
      payload.submitted_at = new Date().toISOString();
    }
    const query = form.id
      ? this.sb.client.from(this.table).update(payload).eq('id', form.id)
      : this.sb.client.from(this.table).insert(payload);
    const { data, error } = await query.select('*').single();
    if (error) {
      throw error;
    }
    return data as TaxForm;
  }

  /** Preparer action: advance the process step shown to the client. */
  async updateProcessStatus(
    id: string,
    status: TaxProcessStatus
  ): Promise<void> {
    const { error } = await this.sb.client
      .from(this.table)
      .update({ process_status: status, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) {
      throw error;
    }
  }
}
