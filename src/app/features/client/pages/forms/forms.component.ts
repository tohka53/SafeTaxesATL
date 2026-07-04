import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import { AuthService } from '@core/services/auth.service';
import { TaxFormService } from '@core/services/tax-form.service';
import { FormDefService } from '@core/services/form-def.service';
import { PdfService } from '@core/services/pdf.service';
import { FormStatus, TaxForm } from '@core/models/tax-form.model';
import { CLIENT_PROFILE_FORM_DEF, FormDef } from '@core/models/form-def.model';
import { encodeId } from '@core/utils/crypto-id';

@Component({
  selector: 'app-client-forms',
  templateUrl: './forms.component.html'
})
export class FormsComponent implements OnInit {
  readonly FormStatus = FormStatus;
  /** client_profile (hardcoded tile) + whatever's active in form_definitions. */
  defs: FormDef[] = [CLIENT_PROFILE_FORM_DEF];

  loading = true;
  grouped: Record<number, TaxForm[]> = {};
  years: number[] = [];

  constructor(
    private readonly auth: AuthService,
    private readonly taxForms: TaxFormService,
    private readonly formDefs: FormDefService,
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
      const [grouped, dynamicDefs] = await Promise.all([
        this.taxForms.listByUserGroupedByYear(uid),
        this.formDefs.list()
      ]);
      this.grouped = grouped;
      this.defs = [CLIENT_PROFILE_FORM_DEF, ...dynamicDefs];
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
    void this.router.navigate(['/client/forms', encodeId(form.id)]);
  }

  download(form: TaxForm): void {
    const type = form.form_type ?? 'client_profile';
    if (type === 'client_profile') {
      this.pdf.downloadProfile(form.extra ?? {});
      return;
    }
    const d = this.defs.find((x) => x.id === type);
    if (d) {
      this.pdf.downloadGeneric(d, form.extra ?? {}, this.lang);
    }
  }
}
