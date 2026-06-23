import { Injectable } from '@angular/core';

import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';
import { MessageLog } from '@core/models/message-log.model';

@Injectable({ providedIn: 'root' })
export class MessageLogService {
  private readonly table = 'message_log';

  constructor(
    private readonly sb: SupabaseService,
    private readonly auth: AuthService
  ) {}

  async list(): Promise<MessageLog[]> {
    const { data, error } = await this.sb.client
      .from(this.table)
      .select('*')
      .order('sent_at', { ascending: false });
    if (error) {
      throw error;
    }
    return (data ?? []) as MessageLog[];
  }

  async log(entries: MessageLog[]): Promise<void> {
    if (!entries.length) {
      return;
    }
    const rows = entries.map((e) => ({ ...e, sent_by: this.auth.userId }));
    const { error } = await this.sb.client.from(this.table).insert(rows);
    if (error) {
      throw error;
    }
  }
}
