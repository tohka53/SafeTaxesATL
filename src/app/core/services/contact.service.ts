import { Injectable } from '@angular/core';

import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';
import { CrmContact } from '@core/models/contact.model';
import { Profile } from '@core/models/profile.model';
import { UserRole } from '@core/models/user-role.enum';

const digits = (v: string | null | undefined): string =>
  (v ?? '').replace(/\D+/g, '');

@Injectable({ providedIn: 'root' })
export class ContactService {
  private readonly table = 'crm_contacts';

  constructor(
    private readonly sb: SupabaseService,
    private readonly auth: AuthService
  ) {}

  async list(): Promise<CrmContact[]> {
    const { data, error } = await this.sb.client
      .from(this.table)
      .select('*')
      .order('last_update', { ascending: false });
    if (error) {
      throw error;
    }
    return (data ?? []) as CrmContact[];
  }

  /** Find an existing profile whose phone matches (digits-only comparison). */
  private async profileIdByPhone(phone: string | null): Promise<string | null> {
    const want = digits(phone);
    if (!want) {
      return null;
    }
    const { data } = await this.sb.client
      .from('profiles')
      .select('id, phone');
    const match = (data ?? []).find(
      (p: { id: string; phone: string | null }) => digits(p.phone) === want
    );
    return match?.id ?? null;
  }

  async create(c: CrmContact): Promise<CrmContact> {
    const linked = c.linked_profile_id ?? (await this.profileIdByPhone(c.phone));
    const payload: CrmContact = {
      ...c,
      linked_profile_id: linked,
      last_update: new Date().toISOString(),
      created_by: this.auth.userId
    };
    const { data, error } = await this.sb.client
      .from(this.table)
      .insert(payload)
      .select('*')
      .single();
    if (error) {
      throw error;
    }
    return data as CrmContact;
  }

  async update(c: CrmContact): Promise<CrmContact> {
    const linked = await this.profileIdByPhone(c.phone);
    const { data, error } = await this.sb.client
      .from(this.table)
      .update({
        full_name: c.full_name,
        phone: c.phone,
        email: c.email,
        notes: c.notes,
        linked_profile_id: linked,
        last_update: new Date().toISOString()
      })
      .eq('id', c.id)
      .select('*')
      .single();
    if (error) {
      throw error;
    }
    return data as CrmContact;
  }

  async remove(id: string): Promise<void> {
    const { error } = await this.sb.client.from(this.table).delete().eq('id', id);
    if (error) {
      throw error;
    }
  }

  /** Stamp last_communication = now for the given contacts. */
  async markCommunicated(ids: string[]): Promise<void> {
    if (!ids.length) {
      return;
    }
    const now = new Date().toISOString();
    const { error } = await this.sb.client
      .from(this.table)
      .update({ last_communication: now, last_update: now })
      .in('id', ids);
    if (error) {
      throw error;
    }
  }

  /** Create contacts from existing client profiles not already present. */
  async importFromProfiles(): Promise<number> {
    const [{ data: profiles }, existing] = await Promise.all([
      this.sb.client.from('profiles').select('*').eq('role', UserRole.Client),
      this.list()
    ]);
    const seenPhones = new Set(existing.map((c) => digits(c.phone)).filter(Boolean));
    const seenLinked = new Set(existing.map((c) => c.linked_profile_id).filter(Boolean));

    const toInsert: CrmContact[] = [];
    for (const p of (profiles ?? []) as Profile[]) {
      if (seenLinked.has(p.id)) {
        continue;
      }
      if (p.phone && seenPhones.has(digits(p.phone))) {
        continue;
      }
      toInsert.push({
        full_name: p.full_name,
        phone: p.phone,
        email: p.email,
        notes: null,
        linked_profile_id: p.id,
        last_communication: null,
        last_update: new Date().toISOString(),
        created_by: this.auth.userId
      });
    }
    if (!toInsert.length) {
      return 0;
    }
    const { error } = await this.sb.client.from(this.table).insert(toInsert);
    if (error) {
      throw error;
    }
    return toInsert.length;
  }
}
