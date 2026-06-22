import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { PdfService } from '@core/services/pdf.service';
import {
  FILING_STATUSES,
  FormStatus,
  TaxForm,
  TaxProcessStatus
} from '@core/models/tax-form.model';
import { INCOME_RANGES } from '@core/models/profile.model';

/**
 * Reusable reactive tax intake form.
 * - Public landing: emits (download) + (submitted); parent emails the PDF.
 * - Internal (client/preparer): emits (saveDraft) + (submitted) to persist.
 * Prefill via [initial]; lock a submitted form via [locked].
 */
@Component({
  selector: 'app-tax-form',
  templateUrl: './tax-form.component.html'
})
export class TaxFormComponent implements OnInit, OnChanges {
  @Input() initial: Partial<TaxForm> | null = null;
  @Input() userId: string | null = null;
  @Input() locked = false;
  @Input() showActions = true;
  /** Public mode shows "Download PDF + Send"; internal shows "Save draft + Submit". */
  @Input() mode: 'public' | 'internal' = 'internal';

  @Output() saveDraft = new EventEmitter<TaxForm>();
  @Output() submitted = new EventEmitter<TaxForm>();
  @Output() downloaded = new EventEmitter<TaxForm>();

  readonly incomeRanges = INCOME_RANGES;
  readonly filingStatuses = FILING_STATUSES;
  readonly years: number[] = [];

  form!: FormGroup;
  showAutofillNote = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly pdf: PdfService
  ) {
    const y = new Date().getFullYear();
    this.years = [y, y - 1, y - 2, y - 3];
  }

  ngOnInit(): void {
    const y = new Date().getFullYear();
    this.form = this.fb.group({
      tax_year: [y, Validators.required],
      full_name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      address_line1: [''],
      city: [''],
      state: [''],
      zip: [''],
      ssn: [''],
      bank_name: [''],
      bank_account_number: [''],
      bank_routing_number: [''],
      employer: [''],
      income_range: [''],
      filing_status: [''],
      dependents: [0, [Validators.min(0)]],
      notes: ['']
    });
    this.applyInitial();
    this.applyLock();
  }

  ngOnChanges(changes: SimpleChanges): void {
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

  private applyInitial(): void {
    if (this.initial) {
      this.form.patchValue(this.initial);
      this.showAutofillNote = this.mode === 'internal';
    }
  }

  private applyLock(): void {
    if (this.locked) {
      this.form.disable({ emitEvent: false });
    } else {
      this.form.enable({ emitEvent: false });
    }
  }

  private buildPayload(status: FormStatus): TaxForm {
    const v = this.form.getRawValue();
    return {
      ...(this.initial ?? {}),
      id: this.initial?.id,
      user_id: this.initial?.user_id ?? this.userId ?? '',
      tax_year: Number(v.tax_year),
      status,
      process_status: this.initial?.process_status ?? TaxProcessStatus.Received,
      full_name: v.full_name || null,
      email: v.email || null,
      phone: v.phone || null,
      address_line1: v.address_line1 || null,
      city: v.city || null,
      state: v.state || null,
      zip: v.zip || null,
      ssn: v.ssn || null,
      bank_name: v.bank_name || null,
      bank_account_number: v.bank_account_number || null,
      bank_routing_number: v.bank_routing_number || null,
      employer: v.employer || null,
      income_range: v.income_range || null,
      filing_status: v.filing_status || null,
      dependents: v.dependents != null ? Number(v.dependents) : null,
      notes: v.notes || null,
      extra: this.initial?.extra ?? null
    };
  }

  onSaveDraft(): void {
    this.saveDraft.emit(this.buildPayload(FormStatus.Draft));
  }

  onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }
    this.submitted.emit(this.buildPayload(FormStatus.Submitted));
  }

  onDownloadPdf(): void {
    const payload = this.buildPayload(
      this.initial?.status ?? FormStatus.Draft
    );
    this.pdf.downloadTaxForm(payload);
    this.downloaded.emit(payload);
  }

  invalid(control: string): boolean {
    const c = this.form.get(control);
    return !!c && c.invalid && (c.touched || c.dirty);
  }
}
