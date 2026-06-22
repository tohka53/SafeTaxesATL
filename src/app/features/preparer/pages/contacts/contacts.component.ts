import { Component, OnInit } from '@angular/core';

import { ContactService } from '@core/services/contact.service';
import { CrmContact } from '@core/models/contact.model';

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
  selected = new Set<string>();

  showForm = false;
  editingId: string | null = null;
  editModel: Partial<CrmContact> = {};
  message = '';

  constructor(private readonly contactService: ContactService) {}

  async ngOnInit(): Promise<void> {
    await this.reload();
  }

  private async reload(): Promise<void> {
    this.loading = true;
    try {
      this.contacts = await this.contactService.list();
      this.selected.clear();
    } catch (e) {
      console.warn('contacts load', e);
    } finally {
      this.loading = false;
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
    return (p ?? '').replace(/[^\d+]/g, '');
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
    const arr = [`subject=${encodeURIComponent('Safe Taxes ATL')}`];
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
    await this.stamp(list);
  }

  async smsScope(): Promise<void> {
    const list = this.recipients();
    const phones = list.map((c) => this.tel(c.phone)).filter((p) => !!p);
    if (!phones.length) {
      return;
    }
    window.location.href = `sms:${phones.join(',')}${this.smsBody()}`;
    await this.stamp(list);
  }

  emailOne(c: CrmContact): void {
    if (!c.email) {
      return;
    }
    const params = this.mailParams();
    window.location.href = `mailto:${c.email}?${params.join('&')}`;
    void this.markOne(c);
  }

  smsOne(c: CrmContact): void {
    const p = this.tel(c.phone);
    if (!p) {
      return;
    }
    window.location.href = `sms:${p}${this.smsBody()}`;
    void this.markOne(c);
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
