import { Injectable } from '@angular/core';

import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';
import { CaseStatus, TaxCase } from '@core/models/tax-case.model';

@Injectable({ providedIn: 'root' })
export class CaseService {
  private readonly table = 'tax_cases';

  constructor(
    private readonly sb: SupabaseService,
    private readonly auth: AuthService
  ) {}

  async listByUser(userId: string): Promise<TaxCase[]> {
    const { data, error } = await this.sb.client
      .from(this.table)
      .select('*')
      .eq('user_id', userId)
      .order('tax_year', { ascending: false });
    if (error) {
      throw error;
    }
    return (data ?? []) as TaxCase[];
  }

  async start(userId: string, year: number): Promise<TaxCase> {
    const { data, error } = await this.sb.client
      .from(this.table)
      .insert({
        user_id: userId,
        tax_year: year,
        status: 'started' as CaseStatus,
        created_by: this.auth.userId
      })
      .select('*')
      .single();
    if (error) {
      throw error;
    }
    return data as TaxCase;
  }

  async save(c: TaxCase): Promise<TaxCase> {
    const { data, error } = await this.sb.client
      .from(this.table)
      .update({
        status: c.status,
        requested: c.requested,
        request_note: c.request_note,
        updated_at: new Date().toISOString()
      })
      .eq('id', c.id)
      .select('*')
      .single();
    if (error) {
      throw error;
    }
    return data as TaxCase;
  }
}
