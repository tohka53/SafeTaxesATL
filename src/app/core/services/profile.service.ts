import { Injectable } from '@angular/core';

import { SupabaseService } from './supabase.service';
import { Profile } from '@core/models/profile.model';
import { UserRole } from '@core/models/user-role.enum';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  constructor(private readonly sb: SupabaseService) {}

  async get(id: string): Promise<Profile | null> {
    const { data, error } = await this.sb.client
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();
    if (error) {
      console.warn('profile.get', error.message);
      return null;
    }
    return data as Profile;
  }

  async upsert(profile: Partial<Profile> & { id: string }): Promise<Profile> {
    const payload = { ...profile, updated_at: new Date().toISOString() };
    const { data, error } = await this.sb.client
      .from('profiles')
      .upsert(payload, { onConflict: 'id' })
      .select('*')
      .single();
    if (error) {
      throw error;
    }
    return data as Profile;
  }

  /** Preparer view: every client profile. RLS limits this to staff roles. */
  async listClients(): Promise<Profile[]> {
    const { data, error } = await this.sb.client
      .from('profiles')
      .select('*')
      .eq('role', UserRole.Client)
      .order('full_name', { ascending: true });
    if (error) {
      throw error;
    }
    return (data ?? []) as Profile[];
  }
}
