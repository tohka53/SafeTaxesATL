import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import { AuthService } from '@core/services/auth.service';
import { TaxFormService } from '@core/services/tax-form.service';
import { ProfileService } from '@core/services/profile.service';
import { FormStatus, TaxForm } from '@core/models/tax-form.model';
import {
  IntakeValue,
  intakeToTaxForm,
  dynamicToTaxForm
} from '@core/models/intake.util';
import { FormDef, findFormDef } from '@core/models/form-def.model';
import { Profile } from '@core/models/profile.model';

@Component({
  selector: 'app-client-form-editor',
  templateUrl: './form-editor.component.html'
})
export class FormEditorComponent implements OnInit {
  loading = true;
  saving = false;
  locked = false;

  formType = 'client_profile';
  isCustom = true; // client_profile uses the dedicated rich component
  def: FormDef | null = null; // for dynamic forms
  initial: IntakeValue | null = null;
  userId: string | null = null;
  existing: TaxForm | null = null;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly auth: AuthService,
    private readonly taxForms: TaxFormService,
    private readonly profiles: ProfileService,
    private readonly translate: TranslateService
  ) {}

  async ngOnInit(): Promise<void> {
    this.userId = this.auth.userId;
    const id = this.route.snapshot.paramMap.get('id');
    const type = this.route.snapshot.paramMap.get('type');

    if (id && id !== 'new') {
      const f = await this.taxForms.getById(id);
      this.existing = f;
      this.formType = f?.form_type ?? 'client_profile';
      this.locked = f?.status === FormStatus.Submitted;
      this.initial = (f?.extra as IntakeValue) ?? null;
    } else {
      this.formType = type ?? 'client_profile';
      this.initial =
        this.formType === 'client_profile'
          ? this.fromProfile(this.auth.profile ?? (this.userId ? await this.profiles.get(this.userId) : null))
          : { taxYear: new Date().getFullYear() };
    }

    this.isCustom = this.formType === 'client_profile';
    if (!this.isCustom) {
      this.def = findFormDef(this.formType) ?? null;
      if (!this.def) {
        this.isCustom = true;
        this.formType = 'client_profile';
      }
    }
    this.loading = false;
  }

  get title(): string {
    if (this.isCustom) {
      return this.translate.instant('pf.title');
    }
    const lang = this.translate.currentLang || 'en';
    return this.def ? (lang === 'en' ? this.def.en : this.def.es) : '';
  }

  private fromProfile(p: Profile | null): IntakeValue {
    const parts = (p?.full_name ?? '').trim().split(' ');
    return {
      tax_year: new Date().getFullYear(),
      taxpayer: {
        first: parts[0] ?? '',
        last: parts.slice(1).join(' ') ?? '',
        ssn: p?.ssn ?? '',
        email: p?.email ?? '',
        cell: p?.phone ?? '',
        addr: p?.address_line1 ?? '',
        city: p?.city ?? '',
        state: p?.state ?? '',
        zip: p?.zip ?? '',
        occ: p?.employer ?? ''
      },
      bank_name: p?.bank_name ?? '',
      bank_acct: p?.bank_account_number ?? '',
      bank_rout: p?.bank_routing_number ?? ''
    };
  }

  onSaveDraft(raw: IntakeValue): void {
    void this.persist(raw, FormStatus.Draft, '/client/forms');
  }

  onSubmit(raw: IntakeValue): void {
    void this.persist(raw, FormStatus.Submitted, '/client/status');
  }

  private async persist(
    raw: IntakeValue,
    status: FormStatus,
    redirect: string
  ): Promise<void> {
    if (!this.userId) {
      return;
    }
    this.saving = true;
    try {
      const tf = this.isCustom
        ? intakeToTaxForm(raw, {
            id: this.existing?.id,
            userId: this.userId,
            status,
            processStatus: this.existing?.process_status,
            formType: 'client_profile'
          })
        : dynamicToTaxForm(raw, {
            id: this.existing?.id,
            userId: this.userId,
            status,
            processStatus: this.existing?.process_status,
            formType: this.formType
          });
      await this.taxForms.save(tf);
      await this.router.navigateByUrl(redirect);
    } catch (e) {
      console.warn('save form', e);
    } finally {
      this.saving = false;
    }
  }
}
