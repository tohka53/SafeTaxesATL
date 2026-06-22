import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

import { PdfService } from '@core/services/pdf.service';
import { FieldDef, FormDef, SectionDef } from '@core/models/form-def.model';
import { US_STATES } from '@core/data/us-states';
import { citiesForState } from '@core/data/us-cities';
import { US_BANKS } from '@core/data/us-banks';

/** Renders any FormDef as a reactive form. One component, many form types. */
@Component({
  selector: 'app-dynamic-form',
  templateUrl: './dynamic-form.component.html'
})
export class DynamicFormComponent implements OnInit, OnChanges {
  @Input() def!: FormDef;
  @Input() initial: Record<string, any> | null = null;
  @Input() userId: string | null = null;
  @Input() locked = false;
  @Input() mode: 'public' | 'internal' = 'internal';

  @Output() saveDraft = new EventEmitter<Record<string, any>>();
  @Output() submitted = new EventEmitter<Record<string, any>>();
  @Output() downloaded = new EventEmitter<Record<string, any>>();

  form!: FormGroup;
  readonly states = US_STATES;
  readonly banks = US_BANKS;

  /** Cities for the form's selected state (field named `state`). */
  cityOptions(current: unknown): string[] {
    const list = citiesForState(this.form?.get('state')?.value);
    const cur = (current as string) || '';
    return cur && !list.includes(cur) ? [cur, ...list] : list;
  }

  bankOptions(current: unknown): string[] {
    const cur = (current as string) || '';
    return cur && !this.banks.includes(cur) ? [cur, ...this.banks] : this.banks;
  }

  constructor(
    private readonly fb: FormBuilder,
    private readonly pdf: PdfService,
    public readonly translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.build();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['def'] && !changes['def'].firstChange) {
      this.build();
      return;
    }
    if (!this.form) {
      return;
    }
    if (changes['initial']) {
      this.applyInitial();
    }
    if (changes['locked']) {
      this.applyLock();
    }
  }

  private build(): void {
    const group: Record<string, any> = {};
    for (const s of this.def.sections) {
      for (const fld of s.fields) {
        group[fld.name] = [''];
      }
    }
    this.form = this.fb.group(group);
    const ty = this.form.get('taxYear');
    if (ty && !ty.value) {
      ty.setValue(new Date().getFullYear());
    }
    this.applyInitial();
    this.applyLock();
  }

  private applyInitial(): void {
    if (this.initial) {
      this.form.patchValue(this.initial);
    }
  }

  private applyLock(): void {
    if (this.locked) {
      this.form.disable({ emitEvent: false });
    } else {
      this.form.enable({ emitEvent: false });
    }
  }

  private get lang(): string {
    return this.translate.currentLang || this.translate.defaultLang || 'en';
  }

  label(fld: FieldDef): string {
    return this.lang === 'en' ? fld.en : fld.es;
  }
  sectionTitle(s: SectionDef): string {
    return this.lang === 'en' ? s.en : s.es;
  }

  onSaveDraft(): void {
    this.saveDraft.emit(this.form.getRawValue());
  }
  onSubmit(): void {
    this.submitted.emit(this.form.getRawValue());
  }
  onDownload(): void {
    const v = this.form.getRawValue();
    this.pdf.downloadGeneric(this.def, v, this.lang);
    this.downloaded.emit(v);
  }
}
