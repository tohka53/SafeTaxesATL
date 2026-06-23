import { Component, OnInit } from '@angular/core';

import { TemplateService } from '@core/services/template.service';
import { MessageTemplate } from '@core/models/message-template.model';

@Component({
  selector: 'app-preparer-templates',
  templateUrl: './templates.component.html'
})
export class TemplatesComponent implements OnInit {
  loading = true;
  saving = false;
  templates: MessageTemplate[] = [];
  showForm = false;
  editingId: string | null = null;
  model: Partial<MessageTemplate> = {};
  error = '';

  constructor(private readonly svc: TemplateService) {}

  async ngOnInit(): Promise<void> {
    await this.reload();
  }

  private async reload(): Promise<void> {
    this.loading = true;
    try {
      this.templates = await this.svc.list();
    } catch (e) {
      console.warn('templates load', e);
    } finally {
      this.loading = false;
    }
  }

  newTemplate(): void {
    this.editingId = null;
    this.model = { name: '', type: 'email', subject: '', body: '' };
    this.showForm = true;
    this.error = '';
  }

  edit(t: MessageTemplate): void {
    this.editingId = t.id ?? null;
    this.model = { ...t };
    this.showForm = true;
    this.error = '';
  }

  cancel(): void {
    this.showForm = false;
    this.model = {};
    this.editingId = null;
  }

  async save(): Promise<void> {
    this.saving = true;
    this.error = '';
    try {
      if (this.editingId) {
        await this.svc.update({ ...(this.model as MessageTemplate), id: this.editingId });
      } else {
        await this.svc.create(this.model as MessageTemplate);
      }
      this.cancel();
      await this.reload();
    } catch (e) {
      this.error =
        (e as { message?: string })?.message ||
        'No se pudo guardar. ¿Corriste supabase/migration-templates.sql?';
    } finally {
      this.saving = false;
    }
  }

  async remove(t: MessageTemplate): Promise<void> {
    if (!t.id) {
      return;
    }
    await this.svc.remove(t.id);
    await this.reload();
  }
}
