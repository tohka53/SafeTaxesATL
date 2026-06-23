import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { AuthService } from '@core/services/auth.service';
import { ProfileService } from '@core/services/profile.service';
import { TaxFormService } from '@core/services/tax-form.service';
import { DocumentService } from '@core/services/document.service';
import { PdfService } from '@core/services/pdf.service';
import { Profile } from '@core/models/profile.model';
import {
  FormStatus,
  TAX_PROCESS_STEPS,
  TaxForm,
  TaxProcessStatus
} from '@core/models/tax-form.model';
import { TaxDocument } from '@core/models/document.model';
import { findFormDef } from '@core/models/form-def.model';
import { CaseService } from '@core/services/case.service';
import {
  CASE_STATUSES,
  CaseStatus,
  REQUEST_ITEMS,
  TaxCase
} from '@core/models/tax-case.model';
import { decodeId } from '@core/utils/crypto-id';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-preparer-client-detail',
  templateUrl: './client-detail.component.html'
})
export class ClientDetailComponent implements OnInit {
  readonly FormStatus = FormStatus;
  readonly steps = TAX_PROCESS_STEPS;

  loading = true;
  clientId = '';
  profile: Profile | null = null;
  grouped: Record<number, TaxForm[]> = {};
  years: number[] = [];
  documents: TaxDocument[] = [];
  openYear: number | null = null;

  uploadYear = new Date().getFullYear();
  uploadYears: number[] = [];
  uploadFile: File | null = null;
  uploading = false;
  uploadOk = false;

  readonly caseStatuses = CASE_STATUSES;
  readonly requestItems = REQUEST_ITEMS;
  cases: TaxCase[] = [];
  caseYear = new Date().getFullYear();
  caseStatus: CaseStatus = 'started';
  caseReq = new Set<string>();
  caseNote = '';
  caseMsg = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly auth: AuthService,
    private readonly profiles: ProfileService,
    private readonly taxForms: TaxFormService,
    private readonly docs: DocumentService,
    private readonly pdf: PdfService,
    private readonly caseService: CaseService,
    private readonly translate: TranslateService
  ) {}

  // ----- Tax case (per-year process) -----
  get selectedCase(): TaxCase | null {
    return this.cases.find((c) => c.tax_year === Number(this.caseYear)) ?? null;
  }
  caseStatusLabel(s: CaseStatus): string {
    return this.translate.instant('cse.' + s);
  }
  syncCaseEdit(): void {
    const c = this.selectedCase;
    this.caseStatus = c?.status ?? 'started';
    this.caseReq = new Set(c?.requested ?? []);
    this.caseNote = c?.request_note ?? '';
  }
  onCaseYearChange(): void {
    this.syncCaseEdit();
  }
  isReq(item: string): boolean {
    return this.caseReq.has(item);
  }
  toggleReq(item: string): void {
    if (this.caseReq.has(item)) {
      this.caseReq.delete(item);
    } else {
      this.caseReq.add(item);
    }
  }
  async startCase(): Promise<void> {
    this.caseMsg = '';
    try {
      await this.caseService.start(this.clientId, Number(this.caseYear));
      this.cases = await this.caseService.listByUser(this.clientId);
      this.syncCaseEdit();
    } catch (e) {
      this.caseMsg = String((e as { message?: string })?.message ?? e);
    }
  }
  async saveCase(): Promise<void> {
    const c = this.selectedCase;
    if (!c?.id) {
      return;
    }
    this.caseMsg = '';
    try {
      await this.caseService.save({
        ...c,
        status: this.caseStatus,
        requested: [...this.caseReq],
        request_note: this.caseNote || null
      });
      this.cases = await this.caseService.listByUser(this.clientId);
      this.caseMsg = 'ok';
    } catch (e) {
      this.caseMsg = String((e as { message?: string })?.message ?? e);
    }
  }

  private get lang(): string {
    return this.translate.currentLang || 'en';
  }

  formTypeLabel(type: string | undefined): string {
    const d = findFormDef(type ?? 'client_profile');
    return d ? (this.lang === 'en' ? d.en : d.es) : (type ?? '');
  }

  async ngOnInit(): Promise<void> {
    this.clientId = decodeId(this.route.snapshot.paramMap.get('id'));
    const y = new Date().getFullYear();
    this.uploadYears = [y, y - 1, y - 2, y - 3];
    await this.reload();
  }

  private async reload(): Promise<void> {
    this.loading = true;
    try {
      const [profile, grouped, documents] = await Promise.all([
        this.profiles.get(this.clientId),
        this.taxForms.listByUserGroupedByYear(this.clientId),
        this.docs.listByUser(this.clientId)
      ]);
      this.profile = profile;
      this.grouped = grouped;
      this.years = Object.keys(grouped)
        .map(Number)
        .sort((a, b) => b - a);
      this.documents = documents;
      this.openYear = this.years[0] ?? null;
      try {
        this.cases = await this.caseService.listByUser(this.clientId);
      } catch (e) {
        console.warn('cases', e);
      }
      this.syncCaseEdit();
    } catch (e) {
      console.warn('client detail load', e);
    } finally {
      this.loading = false;
    }
  }

  toggleYear(y: number): void {
    this.openYear = this.openYear === y ? null : y;
  }

  docsForYear(year: number): TaxDocument[] {
    return this.documents.filter((d) => d.tax_year === year);
  }

  onFile(e: Event): void {
    const input = e.target as HTMLInputElement;
    this.uploadFile = input.files?.[0] ?? null;
    this.uploadOk = false;
  }

  async upload(): Promise<void> {
    if (!this.uploadFile) {
      return;
    }
    this.uploading = true;
    this.uploadOk = false;
    try {
      await this.docs.upload(
        this.clientId,
        Number(this.uploadYear),
        this.uploadFile,
        this.auth.userId
      );
      this.uploadFile = null;
      this.uploadOk = true;
      await this.reload();
    } catch (e) {
      console.warn('upload', e);
    } finally {
      this.uploading = false;
    }
  }

  async onStatusChange(form: TaxForm, ev: Event): Promise<void> {
    const value = (ev.target as HTMLSelectElement).value as TaxProcessStatus;
    if (!form.id) {
      return;
    }
    try {
      await this.taxForms.updateProcessStatus(form.id, value);
      form.process_status = value;
    } catch (e) {
      console.warn('status change', e);
    }
  }

  downloadForm(form: TaxForm): void {
    const type = form.form_type ?? 'client_profile';
    if (type === 'client_profile') {
      this.pdf.downloadProfile(form.extra ?? {});
      return;
    }
    const d = findFormDef(type);
    if (d) {
      this.pdf.downloadGeneric(d, form.extra ?? {}, this.lang);
    } else {
      this.pdf.downloadTaxForm(form);
    }
  }

  async openDoc(doc: TaxDocument): Promise<void> {
    try {
      const url = await this.docs.getSignedUrl(doc.storage_path);
      window.open(url, '_blank');
    } catch (e) {
      console.warn('openDoc', e);
    }
  }
}
