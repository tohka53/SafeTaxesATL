import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { FormDefService } from '@core/services/form-def.service';
import { FieldDef, FieldType, FormDef, SectionDef } from '@core/models/form-def.model';

const FIELD_TYPES: FieldType[] = [
  'text',
  'email',
  'tel',
  'date',
  'number',
  'money',
  'yesno',
  'textarea',
  'select',
  'state',
  'city',
  'bank'
];

function blankDef(): FormDef {
  return { id: '', es: '', en: '', icon: '📄', is_active: true, sort_order: 0, sections: [] };
}
function blankSection(): SectionDef {
  return { es: '', en: '', fields: [] };
}
function blankField(): FieldDef {
  return { name: '', es: '', en: '', type: 'text' };
}

/**
 * Preparer/admin "Form Builder": CRUD over the `form_definitions` table.
 * Lets staff add/remove whole forms and, within a form, add/remove/reorder
 * sections and fields — no code deploy needed. The Client Profile intake
 * form is intentionally not manageable here (see form-def.model.ts).
 */
@Component({
  selector: 'app-preparer-form-builder',
  templateUrl: './form-builder.component.html'
})
export class FormBuilderComponent implements OnInit {
  readonly fieldTypes = FIELD_TYPES;

  loading = true;
  saving = false;
  seeding = false;
  error = '';
  listError = '';
  listNotice = '';

  defs: FormDef[] = [];
  showEditor = false;
  isNew = false;
  model: FormDef = blankDef();

  constructor(
    private readonly formDefs: FormDefService,
    public readonly translate: TranslateService
  ) {}

  async ngOnInit(): Promise<void> {
    await this.reload();
  }

  private async reload(): Promise<void> {
    this.loading = true;
    try {
      this.defs = await this.formDefs.list({ includeInactive: true });
    } catch (e) {
      console.warn('form defs load', e);
    } finally {
      this.loading = false;
    }
  }

  /** "Cargar formularios de ejemplo" — creates the 6 starter forms in one click, no SQL needed. */
  async seedDefaults(): Promise<void> {
    this.seeding = true;
    this.listError = '';
    this.listNotice = '';
    try {
      const { created, skipped } = await this.formDefs.seedDefaults();
      await this.reload();
      if (created > 0) {
        this.listNotice =
          this.lang === 'en'
            ? `Created ${created} form${created === 1 ? '' : 's'}${skipped ? ` (${skipped} already existed)` : ''}.`
            : `Se crearon ${created} formulario${created === 1 ? '' : 's'}${skipped ? ` (${skipped} ya existía${skipped === 1 ? '' : 'n'})` : ''}.`;
      } else {
        this.listNotice =
          this.lang === 'en'
            ? 'The 6 starter forms already exist.'
            : 'Los 6 formularios de ejemplo ya existen.';
      }
    } catch (e) {
      this.listError =
        (e as { message?: string })?.message ||
        (this.lang === 'en'
          ? "Couldn't create the starter forms. Does the form_definitions table exist yet? Run supabase/migration-form-definitions.sql once in the Supabase SQL Editor first."
          : 'No se pudieron crear los formularios de ejemplo. ¿Ya existe la tabla form_definitions? Corre primero supabase/migration-form-definitions.sql una vez en el SQL Editor de Supabase.');
    } finally {
      this.seeding = false;
    }
  }

  get lang(): string {
    return this.translate.currentLang || 'en';
  }
  label(d: { es: string; en: string }): string {
    return this.lang === 'en' ? d.en : d.es;
  }
  fieldCount(d: FormDef): number {
    return d.sections.reduce((n, s) => n + s.fields.length, 0);
  }

  newDef(): void {
    this.isNew = true;
    this.model = blankDef();
    this.model.sort_order = Math.max(0, ...this.defs.map((d) => d.sort_order ?? 0)) + 10;
    this.showEditor = true;
    this.error = '';
  }

  edit(d: FormDef): void {
    this.isNew = false;
    // Deep copy so Cancel doesn't leave stray edits applied to the list.
    this.model = JSON.parse(JSON.stringify(d));
    this.showEditor = true;
    this.error = '';
  }

  cancel(): void {
    this.showEditor = false;
    this.error = '';
  }

  /** Keeps ids/field keys safe to use as jsonb keys and FormGroup control names. */
  slugify(s: string): string {
    return (s || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // strip accents (combining marks left by NFD)
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
  }

  onIdInput(v: string): void {
    this.model.id = this.slugify(v);
  }
  onFieldNameInput(fld: FieldDef, v: string): void {
    fld.name = this.slugify(v);
  }

  addSection(): void {
    this.model.sections.push(blankSection());
  }
  removeSection(i: number): void {
    this.model.sections.splice(i, 1);
  }
  moveSection(i: number, dir: -1 | 1): void {
    const j = i + dir;
    if (j < 0 || j >= this.model.sections.length) {
      return;
    }
    const [s] = this.model.sections.splice(i, 1);
    this.model.sections.splice(j, 0, s);
  }

  addField(section: SectionDef): void {
    section.fields.push(blankField());
  }
  removeField(section: SectionDef, i: number): void {
    section.fields.splice(i, 1);
  }
  moveField(section: SectionDef, i: number, dir: -1 | 1): void {
    const j = i + dir;
    if (j < 0 || j >= section.fields.length) {
      return;
    }
    const [f] = section.fields.splice(i, 1);
    section.fields.splice(j, 0, f);
  }

  addOption(fld: FieldDef): void {
    (fld.options ??= []).push({ value: '', es: '', en: '' });
  }
  removeOption(fld: FieldDef, i: number): void {
    fld.options?.splice(i, 1);
  }

  get canSave(): boolean {
    return !!(this.model.id && this.model.es && this.model.en) && !this.saving;
  }

  async save(): Promise<void> {
    if (!this.model.id || !this.model.es || !this.model.en) {
      this.error =
        this.lang === 'en'
          ? 'ID, Spanish title and English title are required.'
          : 'Se requieren ID, título en español y título en inglés.';
      return;
    }
    if (this.isNew && this.defs.some((d) => d.id === this.model.id)) {
      this.error = this.lang === 'en' ? 'That ID is already in use.' : 'Ese ID ya está en uso.';
      return;
    }
    for (const s of this.model.sections) {
      for (const f of s.fields) {
        if (!f.name || !f.es || !f.en) {
          this.error =
            this.lang === 'en'
              ? 'Every field needs a key, a Spanish label and an English label.'
              : 'Todo campo necesita clave, etiqueta en español y etiqueta en inglés.';
          return;
        }
      }
    }

    this.saving = true;
    this.error = '';
    try {
      if (this.isNew) {
        await this.formDefs.create(this.model);
      } else {
        await this.formDefs.update(this.model);
      }
      this.showEditor = false;
      await this.reload();
    } catch (e) {
      this.error =
        (e as { message?: string })?.message ||
        (this.lang === 'en'
          ? "Couldn't save. Did you run supabase/migration-form-definitions.sql?"
          : 'No se pudo guardar. ¿Corriste supabase/migration-form-definitions.sql?');
    } finally {
      this.saving = false;
    }
  }

  async toggleActive(d: FormDef): Promise<void> {
    try {
      await this.formDefs.setActive(d.id, !d.is_active);
      await this.reload();
    } catch (e) {
      console.warn('toggle active', e);
    }
  }

  async remove(d: FormDef): Promise<void> {
    const msg =
      this.lang === 'en'
        ? `Delete "${this.label(d)}"? This cannot be undone. If clients already submitted this form type, deactivate it instead so their history keeps its label.`
        : `¿Eliminar "${this.label(d)}"? No se puede deshacer. Si ya hay clientes con este tipo de formulario enviado, mejor desactívalo para no perder la etiqueta en su historial.`;
    if (!confirm(msg)) {
      return;
    }
    try {
      await this.formDefs.remove(d.id);
      await this.reload();
    } catch (e) {
      console.warn('remove form def', e);
    }
  }
}
