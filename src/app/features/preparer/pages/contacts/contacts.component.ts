import { Component, OnInit } from '@angular/core';

import { ContactService } from '@core/services/contact.service';
import { TemplateService } from '@core/services/template.service';
import { MessageLogService } from '@core/services/message-log.service';
import { CrmContact } from '@core/models/contact.model';
import { MessageTemplate } from '@core/models/message-template.model';
import { usPhoneE164 } from '@shared/directives/us-phone.directive';
import { environment } from '@env/environment';

@Component({
  selector: 'app-preparer-contacts',
  templateUrl: './contacts.component.html'
})
export class ContactsComponent implements OnInit {
  loading = true;
  saving = false;
  importing = false;
  contacts: CrmContact[] = [];
  q = '';
  outreachMessage = '';
  outreachSubject = '';
  selectedTemplateId = '';
  templates: MessageTemplate[] = [];
  emailedIds = new Set<string>();
  smsedIds = new Set<string>();
  selected = new Set<string>();

  showForm = false;
  editingId: string | null = null;
  editModel: Partial<CrmContact> = {};
  message = '';
  error = '';

  constructor(
    private readonly contactService: ContactService,
    private readonly templateService: TemplateService,
    private readonly logService: MessageLogService
  ) {}

  async ngOnInit(): Promise<void> {
    await this.reload();
    try {
      this.templates = await this.templateService.list();
    } catch (e) {
      console.warn('templates load', e);
    }
  }

  private async reload(): Promise<void> {
    this.loading = true;
    try {
      this.contacts = await this.contactService.list();
      this.selected.clear();
      try {
        const logs = await this.logService.list();
        this.emailedIds = new Set(
          logs.filter((l) => l.channel === 'email').map((l) => l.contact_id)
        );
        this.smsedIds = new Set(
          logs.filter((l) => l.channel === 'sms').map((l) => l.contact_id)
        );
      } catch (e) {
        console.warn('message log load', e);
      }
    } catch (e) {
      console.warn('contacts load', e);
    } finally {
      this.loading = false;
    }
  }

  applyTemplate(): void {
    const t = this.templates.find((x) => x.id === this.selectedTemplateId);
    if (!t) {
      return;
    }
    this.outreachMessage = t.body ?? '';
    if (t.type === 'email') {
      this.outreachSubject = t.subject ?? '';
    }
  }

  wasEmailed(id?: string): boolean {
    return !!id && this.emailedIds.has(id);
  }
  wasSmsed(id?: string): boolean {
    return !!id && this.smsedIds.has(id);
  }

  private async logSends(list: CrmContact[], channel: 'email' | 'sms'): Promise<void> {
    const entries = list
      .filter((c) => c.id)
      .map((c) => ({
        contact_id: c.id as string,
        channel,
        subject: channel === 'email' ? this.outreachSubject || null : null,
        body: this.outreachMessage || null
      }));
    try {
      await this.logService.log(entries);
    } catch (e) {
      console.warn('log send', e);
    }
    for (const c of list) {
      if (c.id) {
        (channel === 'email' ? this.emailedIds : this.smsedIds).add(c.id);
      }
    }
  }

  get filtered(): CrmContact[] {
    const s = this.q.trim().toLowerCase();
    if (!s) {
      return this.contacts;
    }
    return this.contacts.filter((c) =>
      [c.full_name, c.email, c.phone].join(' ').toLowerCase().includes(s)
    );
  }

  get total(): number {
    return this.contacts.length;
  }
  get selectedCount(): number {
    return this.selected.size;
  }
  isSelected(id?: string): boolean {
    return !!id && this.selected.has(id);
  }
  toggle(id?: string): void {
    if (!id) {
      return;
    }
    if (this.selected.has(id)) {
      this.selected.delete(id);
    } else {
      this.selected.add(id);
    }
  }
  get allSelected(): boolean {
    const f = this.filtered;
    return f.length > 0 && f.every((c) => !!c.id && this.selected.has(c.id));
  }
  toggleAll(): void {
    const f = this.filtered;
    if (this.allSelected) {
      f.forEach((c) => c.id && this.selected.delete(c.id));
    } else {
      f.forEach((c) => c.id && this.selected.add(c.id));
    }
  }

  newContact(): void {
    this.editingId = null;
    this.editModel = { full_name: '', phone: '', email: '', notes: '' };
    this.showForm = true;
  }
  edit(c: CrmContact): void {
    this.editingId = c.id ?? null;
    this.editModel = { ...c };
    this.showForm = true;
  }
  cancel(): void {
    this.showForm = false;
    this.editModel = {};
    this.editingId = null;
  }

  async save(): Promise<void> {
    this.saving = true;
    this.error = '';
    try {
      if (this.editingId) {
        await this.contactService.update({
          ...(this.editModel as CrmContact),
          id: this.editingId
        });
      } else {
        await this.contactService.create(this.editModel as CrmContact);
      }
      this.cancel();
      await this.reload();
    } catch (e) {
      this.error =
        (e as { message?: string })?.message ||
        'No se pudo guardar. ¿Corriste supabase/migration-contacts.sql?';
      console.warn('save contact', e);
    } finally {
      this.saving = false;
    }
  }

  async remove(c: CrmContact): Promise<void> {
    if (!c.id) {
      return;
    }
    await this.contactService.remove(c.id);
    await this.reload();
  }

  async markSelected(): Promise<void> {
    const ids = [...this.selected];
    if (!ids.length) {
      return;
    }
    await this.contactService.markCommunicated(ids);
    await this.reload();
  }

  async markOne(c: CrmContact): Promise<void> {
    if (!c.id) {
      return;
    }
    await this.contactService.markCommunicated([c.id]);
    await this.reload();
  }

  // ----- Email / SMS -----

  /** Target = selected contacts, or all (filtered) when nothing is selected. */
  private recipients(): CrmContact[] {
    if (this.selected.size) {
      return this.contacts.filter((c) => c.id && this.selected.has(c.id));
    }
    return this.filtered;
  }

  private tel(p: string | null): string {
    return usPhoneE164(p);
  }

  private async stamp(list: CrmContact[]): Promise<void> {
    const ids = list.map((c) => c.id).filter((id): id is string => !!id);
    if (ids.length) {
      await this.contactService.markCommunicated(ids);
      await this.reload();
    }
  }

  private mailParams(): string[] {
    const m = this.outreachMessage.trim();
    const subject = this.outreachSubject.trim() || environment.brandName;
    const arr = [`subject=${encodeURIComponent(subject)}`];
    if (m) {
      arr.push(`body=${encodeURIComponent(m)}`);
    }
    return arr;
  }

  private smsBody(): string {
    const m = this.outreachMessage.trim();
    return m ? `?body=${encodeURIComponent(m)}` : '';
  }

  async emailScope(): Promise<void> {
    const list = this.recipients();
    const emails = list.map((c) => c.email).filter((e): e is string => !!e);
    if (!emails.length) {
      return;
    }
    const params = [`bcc=${encodeURIComponent(emails.join(','))}`, ...this.mailParams()];
    window.location.href = `mailto:?${params.join('&')}`;
    await this.logSends(list, 'email');
    await this.stamp(list);
  }

  async smsScope(): Promise<void> {
    const list = this.recipients();
    const phones = list.map((c) => this.tel(c.phone)).filter((p) => !!p);
    if (!phones.length) {
      return;
    }
    window.location.href = `sms:${phones.join(',')}${this.smsBody()}`;
    await this.logSends(list, 'sms');
    await this.stamp(list);
  }

  async emailOne(c: CrmContact): Promise<void> {
    if (!c.email || this.wasEmailed(c.id)) {
      return;
    }
    const params = this.mailParams();
    window.location.href = `mailto:${c.email}?${params.join('&')}`;
    await this.logSends([c], 'email');
    await this.markOne(c);
  }

  async smsOne(c: CrmContact): Promise<void> {
    const p = this.tel(c.phone);
    if (!p || this.wasSmsed(c.id)) {
      return;
    }
    window.location.href = `sms:${p}${this.smsBody()}`;
    await this.logSends([c], 'sms');
    await this.markOne(c);
  }

  async importExisting(): Promise<void> {
    this.importing = true;
    this.message = '';
    try {
      const n = await this.contactService.importFromProfiles();
      this.message = `+${n}`;
      await this.reload();
    } catch (e) {
      console.warn('import', e);
    } finally {
      this.importing = false;
    }
  }
}
