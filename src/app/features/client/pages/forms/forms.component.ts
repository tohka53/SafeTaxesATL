import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import { AuthService } from '@core/services/auth.service';
import { TaxFormService } from '@core/services/tax-form.service';
import { PdfService } from '@core/services/pdf.service';
import { FormStatus, TaxForm } from '@core/models/tax-form.model';
import { FORM_DEFINITIONS, FormDef, findFormDef } from '@core/models/form-def.model';

@Component({
  selector: 'app-client-forms',
  templateUrl: './forms.component.html'
})
export class FormsComponent implements OnInit {
  readonly FormStatus = FormStatus;
  readonly defs: FormDef[] = FORM_DEFINITIONS;

  loading = true;
  grouped: Record<number, TaxForm[]> = {};
  years: number[] = [];

  constructor(
    private readonly auth: AuthService,
    private readonly taxForms: TaxFormService,
    private readonly pdf: PdfService,
    private readonly router: Router,
    public readonly translate: TranslateService
  ) {}

  async ngOnInit(): Promise<void> {
    const uid = this.auth.userId;
    if (!uid) {
      this.loading = false;
      return;
    }
    try {
      this.grouped = await this.taxForms.listByUserGroupedByYear(uid);
      this.years = Object.keys(this.grouped)
        .map(Number)
        .sort((a, b) => b - a);
    } catch (e) {
      console.warn('forms load', e);
    } finally {
      this.loading = false;
    }
  }

  private get lang(): string {
    return this.translate.currentLang || 'en';
  }

  defTitle(id: string | undefined): string {
    const d = this.defs.find((x) => x.id === (id ?? 'client_profile'));
    return d ? (this.lang === 'en' ? d.en : d.es) : (id ?? '');
  }

  defLabel(def: FormDef): string {
    return this.lang === 'en' ? def.en : def.es;
  }

  create(def: FormDef): void {
    void this.router.navigate(['/client/forms/new', def.id]);
  }

  open(form: TaxForm): void {
    void this.router.navigate(['/client/forms', form.id]);
  }

  download(form: TaxForm): void {
    const type = form.form_type ?? 'client_profile';
    if (type === 'client_profile') {
      this.pdf.downloadProfile(form.extra ?? {});
      return;
    }
    const d = findFormDef(type);
    if (d) {
      this.pdf.downloadGeneric(d, form.extra ?? {}, this.lang);
    }
  }
}
