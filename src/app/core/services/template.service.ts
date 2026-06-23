import { Injectable } from '@angular/core';

import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';
import { MessageTemplate } from '@core/models/message-template.model';

@Injectable({ providedIn: 'root' })
export class TemplateService {
  private readonly table = 'message_templates';

  constructor(
    private readonly sb: SupabaseService,
    private readonly auth: AuthService
  ) {}

  async list(): Promise<MessageTemplate[]> {
    const { data, error } = await this.sb.client
      .from(this.table)
      .select('*')
      .order('name', { ascending: true });
    if (error) {
      throw error;
    }
    return (data ?? []) as MessageTemplate[];
  }

  async create(t: MessageTemplate): Promise<MessageTemplate> {
    const { data, error } = await this.sb.client
      .from(this.table)
      .insert({ ...t, created_by: this.auth.userId })
      .select('*')
      .single();
    if (error) {
      throw error;
    }
    return data as MessageTemplate;
  }

  async update(t: MessageTemplate): Promise<MessageTemplate> {
    const { data, error } = await this.sb.client
      .from(this.table)
      .update({
        name: t.name,
        type: t.type,
        subject: t.subject,
        body: t.body,
        updated_at: new Date().toISOString()
      })
      .eq('id', t.id)
      .select('*')
      .single();
    if (error) {
      throw error;
    }
    return data as MessageTemplate;
  }

  async remove(id: string): Promise<void> {
    const { error } = await this.sb.client.from(this.table).delete().eq('id', id);
    if (error) {
      throw error;
    }
  }
}
