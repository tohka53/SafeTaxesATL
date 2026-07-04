import { Injectable } from '@angular/core';

import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';
import { DEFAULT_FORM_DEFINITIONS, FormDef, SectionDef } from '@core/models/form-def.model';

interface FormDefRow {
  id: string;
  es: string;
  en: string;
  icon: string;
  sections: SectionDef[];
  is_active: boolean;
  sort_order: number;
  created_by?: string | null;
  created_at?: string;
  updated_at?: string;
}

function rowToFormDef(row: FormDefRow): FormDef {
  return {
    id: row.id,
    es: row.es,
    en: row.en,
    icon: row.icon,
    is_active: row.is_active,
    sort_order: row.sort_order,
    sections: row.sections ?? []
  };
}

/**
 * Reads/writes the dynamic form definitions (Schedule C, Real Estate,
 * Business Intake, DayCare, Employee, Payroll, and any new ones created from
 * the Form Builder) from the `form_definitions` Supabase table.
 *
 * This is the ONLY source of truth at runtime for those form types — the
 * `DEFAULT_FORM_DEFINITIONS` constant in form-def.model.ts is seed data only
 * (see that file's header comment). Preparer/admin manage everything here
 * from the Form Builder UI (features/preparer/pages/form-builder), no code
 * deploy required to add/edit/remove a form or a field.
 */
@Injectable({ providedIn: 'root' })
export class FormDefService {
  private readonly table = 'form_definitions';

  constructor(
    private readonly sb: SupabaseService,
    private readonly auth: AuthService
  ) {}

  /**
   * Forms ordered for display. By default only active ones (what clients /
   * the public landing form may fill out). Pass includeInactive:true for the
   * Form Builder and for staff label lookups on historical submissions,
   * which may reference an archived form type.
   *
   * Never throws — several pages fetch this alongside other data via
   * Promise.all (client detail, client forms list, leads), and a missing
   * table (migration not run yet) or transient RLS error here should not
   * blank out the rest of that page's data. Worst case: dynamic form
   * labels/pickers are empty until the underlying issue is fixed.
   */
  async list(opts: { includeInactive?: boolean } = {}): Promise<FormDef[]> {
    try {
      let query = this.sb.client
        .from(this.table)
        .select('*')
        .order('sort_order', { ascending: true })
        .order('es', { ascending: true });
      if (!opts.includeInactive) {
        query = query.eq('is_active', true);
      }
      const { data, error } = await query;
      if (error) {
        throw error;
      }
      return ((data ?? []) as FormDefRow[]).map(rowToFormDef);
    } catch (e) {
      console.warn(
        'formDef.list — is supabase/migration-form-definitions.sql applied yet?',
        e
      );
      return [];
    }
  }

  async getById(id: string): Promise<FormDef | null> {
    const { data, error } = await this.sb.client
      .from(this.table)
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) {
      console.warn('formDef.getById', error.message);
      return null;
    }
    return data ? rowToFormDef(data as FormDefRow) : null;
  }

  /** Creates a brand-new form type. `def.id` must not already exist. */
  async create(def: FormDef): Promise<FormDef> {
    const { data, error } = await this.sb.client
      .from(this.table)
      .insert({
        id: def.id,
        es: def.es,
        en: def.en,
        icon: def.icon || '📄',
        sections: def.sections,
        is_active: def.is_active ?? true,
        sort_order: def.sort_order ?? 0,
        created_by: this.auth.userId
      })
      .select('*')
      .single();
    if (error) {
      throw error;
    }
    return rowToFormDef(data as FormDefRow);
  }

  /** Updates title/icon/sections/order of an existing form type. Its `id` cannot change. */
  async update(def: FormDef): Promise<FormDef> {
    const { data, error } = await this.sb.client
      .from(this.table)
      .update({
        es: def.es,
        en: def.en,
        icon: def.icon || '📄',
        sections: def.sections,
        is_active: def.is_active ?? true,
        sort_order: def.sort_order ?? 0,
        updated_at: new Date().toISOString()
      })
      .eq('id', def.id)
      .select('*')
      .single();
    if (error) {
      throw error;
    }
    return rowToFormDef(data as FormDefRow);
  }

  /** Show/hide a form from "start a new form" pickers without deleting its history. */
  async setActive(id: string, active: boolean): Promise<void> {
    const { error } = await this.sb.client
      .from(this.table)
      .update({ is_active: active, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) {
      throw error;
    }
  }

  /** Hard delete. Prefer setActive(id, false) if clients may already have submitted this form type. */
  async remove(id: string): Promise<void> {
    const { error } = await this.sb.client.from(this.table).delete().eq('id', id);
    if (error) {
      throw error;
    }
  }

  /**
   * One-click starter data: creates whichever of the 6 default dynamic forms
   * (Schedule C, Real Estate, Business Intake, DayCare, Employee, Payroll)
   * don't already exist, so staff can start from ready-made forms and just
   * tweak them instead of building each one from a blank form. Safe to call
   * more than once — already-existing ids are skipped, not overwritten.
   *
   * Unlike list()/getById(), this DOES throw on failure (e.g. the
   * form_definitions table not existing yet because
   * supabase/migration-form-definitions.sql hasn't been run) — it's an
   * explicit user action from the Form Builder button, so the caller should
   * show the real error instead of silently doing nothing.
   */
  async seedDefaults(): Promise<{ created: number; skipped: number }> {
    const existing = await this.list({ includeInactive: true });
    const existingIds = new Set(existing.map((d) => d.id));
    let created = 0;
    let skipped = 0;
    for (let i = 0; i < DEFAULT_FORM_DEFINITIONS.length; i++) {
      const def = DEFAULT_FORM_DEFINITIONS[i];
      if (existingIds.has(def.id)) {
        skipped++;
        continue;
      }
      await this.create({ ...def, sort_order: (i + 1) * 10 });
      created++;
    }
    return { created, skipped };
  }
}
