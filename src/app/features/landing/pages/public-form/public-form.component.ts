import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import { AuthService } from '@core/services/auth.service';
import { LeadService } from '@core/services/lead.service';
import { EmailService } from '@core/services/email.service';
import { PdfService } from '@core/services/pdf.service';
import { IntakeValue } from '@core/models/intake.util';
import { FormDef, findFormDef } from '@core/models/form-def.model';
import { Profile } from '@core/models/profile.model';

/** Public filler for any form type: PDF download + lead record + email. */
@Component({
  selector: 'app-public-form',
  templateUrl: './public-form.component.html'
})
export class PublicFormComponent implements OnInit {
  loading = true;
  saving = false;
  success = false;
  emailSent = false;

  formType = 'client_profile';
  isCustom = true;
  def: FormDef | null = null;
  initial: IntakeValue | null = null;

  constructor(
    private readonly route: ActivatedRoute,
    public readonly auth: AuthService,
    private readonly lead: LeadService,
    private readonly email: EmailService,
    private readonly pdf: PdfService,
    private readonly translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.formType = this.route.snapshot.paramMap.get('type') ?? 'client_profile';
    this.isCustom = this.formType === 'client_profile';
    if (!this.isCustom) {
      this.def = findFormDef(this.formType) ?? null;
      if (!this.def) {
        this.isCustom = true;
        this.formType = 'client_profile';
      }
    }
    this.initial = this.isCustom
      ? this.fromProfile(this.auth.profile)
      : { taxYear: new Date().getFullYear() };
    this.loading = false;
  }

  get title(): string {
    if (this.isCustom) {
      return this.translate.instant('pf.title');
    }
    const lang = this.translate.currentLang || 'en';
    return this.def ? (lang === 'en' ? this.def.en : this.def.es) : '';
  }

  private fromProfile(p: Profile | null): IntakeValue | null {
    if (!p) {
      return null;
    }
    const parts = (p.full_name ?? '').trim().split(' ');
    return {
      taxpayer: {
        first: parts[0] ?? '',
        last: parts.slice(1).join(' ') ?? '',
        ssn: p.ssn,
        email: p.email,
        cell: p.phone,
        addr: p.address_line1,
        city: p.city,
        state: p.state,
        zip: p.zip,
        occ: p.employer
      },
      bank_name: p.bank_name,
      bank_acct: p.bank_account_number,
      bank_rout: p.bank_routing_number
    };
  }

  async onSubmit(raw: IntakeValue): Promise<void> {
    this.saving = true;
    this.success = false;
    const lang = this.translate.currentLang || 'en';

    let pdfBlob: Blob;
    let name = '';
    let email: string | undefined;
    let phone: string | undefined;

    if (this.isCustom) {
      this.pdf.downloadProfile(raw); // download to device
      pdfBlob = this.pdf.profilePdfBlob(raw);
      const tp = (raw['taxpayer'] ?? {}) as Record<string, any>;
      name = `${tp['first'] ?? ''} ${tp['last'] ?? ''}`.trim();
      email = tp['email'];
      phone = tp['cell'];
    } else {
      const def = this.def!;
      this.pdf.downloadGeneric(def, raw, lang);
      pdfBlob = this.pdf.genericPdfBlob(def, raw, lang);
      name =
        raw['client'] ||
        raw['clientName'] ||
        [raw['firstName'], raw['lastName']].filter(Boolean).join(' ') ||
        raw['businessName'] ||
        '';
      email = raw['email'] || raw['bizEmail'];
      phone = raw['cellPhone'] || raw['bizPhone'] || raw['contactPhone'];
    }

    // Save the record (form type, name, email, phone, full snapshot).
    try {
      await this.lead.createForType(this.formType, raw);
    } catch (e) {
      console.warn('lead', e);
    }

    // Email to the inbox (FormSubmit) with the PDF attached.
    const r = await this.email.sendSubmission({
      subject: `Nuevo formulario (${this.title}) — ${name}`,
      name,
      email,
      phone,
      pdfBlob,
      pdfName: `SafeTaxesATL_${this.formType}.pdf`,
      formTitle: this.title
    });
    this.emailSent = r.sent;

    this.saving = false;
    this.success = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
