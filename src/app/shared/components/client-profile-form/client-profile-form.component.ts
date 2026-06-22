import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges
} from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { PdfService } from '@core/services/pdf.service';
import { IntakeValue } from '@core/models/intake.util';
import { US_STATES } from '@core/data/us-states';
import { citiesForState } from '@core/data/us-cities';
import { US_BANKS } from '@core/data/us-banks';

/**
 * Comprehensive "Client Profile" intake form — a modernized, bilingual port of
 * the QualiTech client profile (taxpayer + spouse + IDs, dependents, EIC
 * questions, homeowner, self-employment, income items, health insurance, bank,
 * signatures). Emits the full raw value; parents map it to a Lead / TaxForm.
 */
@Component({
  selector: 'app-client-profile-form',
  templateUrl: './client-profile-form.component.html'
})
export class ClientProfileFormComponent implements OnInit, OnChanges {
  @Input() initial: IntakeValue | null = null;
  @Input() userId: string | null = null;
  @Input() locked = false;
  @Input() mode: 'public' | 'internal' = 'internal';

  @Output() saveDraft = new EventEmitter<IntakeValue>();
  @Output() submitted = new EventEmitter<IntakeValue>();
  @Output() downloaded = new EventEmitter<IntakeValue>();

  form!: FormGroup;
  years: number[] = [];
  readonly filingOptions = [
    'single',
    'head_of_household',
    'married_joint',
    'married_separate',
    'widow'
  ];
  showAutofill = false;
  readonly states = US_STATES;
  readonly banks = US_BANKS;

  /** Cities for the given state; keeps an already-saved custom value selectable. */
  cityOptions(state: unknown, current: unknown): string[] {
    const list = citiesForState(state as string);
    const cur = (current as string) || '';
    return cur && !list.includes(cur) ? [cur, ...list] : list;
  }

  bankOptions(current: unknown): string[] {
    const cur = (current as string) || '';
    return cur && !this.banks.includes(cur) ? [cur, ...this.banks] : this.banks;
  }

  constructor(
    private readonly fb: FormBuilder,
    private readonly pdf: PdfService
  ) {
    const y = new Date().getFullYear();
    this.years = [y, y - 1, y - 2, y - 3];
  }

  private person(): FormGroup {
    return this.fb.group({
      first: [''],
      last: [''],
      ssn: [''],
      dob: [''],
      addr: [''],
      city: [''],
      state: [''],
      zip: [''],
      cell: [''],
      work: [''],
      home: [''],
      email: [''],
      occ: [''],
      pin: [''],
      id_type: [''],
      id_num: [''],
      id_state: [''],
      id_issue: [''],
      id_exp: ['']
    });
  }

  private depRow(): FormGroup {
    return this.fb.group({
      name: [''],
      dob: [''],
      ssn: [''],
      rel: [''],
      months: ['']
    });
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      tax_year: [new Date().getFullYear(), Validators.required],
      customer_last_year: [''],
      referral: [''],
      filing: [''],
      taxpayer: this.person(),
      spouse: this.person(),
      dep_support: [''],
      daycare: [''],
      dependents: this.fb.array([this.depRow(), this.depRow(), this.depRow()]),
      dep_q1: [''],
      dep_q2: [''],
      dep_q3: [''],
      dep_q4: [''],
      dep_q5: [''],
      homeowner: [''],
      home_units: [''],
      self_emp: [''],
      se_bizname: [''],
      se_ein: [''],
      se_addr: [''],
      se_city: [''],
      se_state: [''],
      se_zip: [''],
      se_phone: [''],
      se_work: [''],
      se_email: [''],
      bank_int: [''],
      bank_int_amt: [''],
      unemp: [''],
      ira: [''],
      vc: [''],
      stocks: [''],
      ins_type: [''],
      ins_name: [''],
      ins_fid: [''],
      ins_member: [''],
      h1095: [''],
      h_year: [''],
      h_market: [''],
      h_hsa: [''],
      h_card: [''],
      h_emp: [''],
      bank_name: [''],
      bank_rout: [''],
      bank_acct: [''],
      sig_tp: [''],
      sig_tp_date: [''],
      sig_sp: [''],
      sig_sp_date: ['']
    });

    this.form.get('taxpayer.first')?.addValidators(Validators.required);
    this.form.get('taxpayer.last')?.addValidators(Validators.required);
    this.form.get('taxpayer.email')?.addValidators(Validators.email);

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

  get dependents(): FormArray {
    return this.form.get('dependents') as FormArray;
  }
  get taxpayer(): FormGroup {
    return this.form.get('taxpayer') as FormGroup;
  }
  get spouse(): FormGroup {
    return this.form.get('spouse') as FormGroup;
  }

  addDependent(): void {
    this.dependents.push(this.depRow());
  }
  removeDependent(i: number): void {
    if (this.dependents.length > 1) {
      this.dependents.removeAt(i);
    }
  }

  private applyInitial(): void {
    if (!this.initial) {
      return;
    }
    const deps = this.initial['dependents'];
    if (Array.isArray(deps)) {
      while (this.dependents.length < deps.length) {
        this.dependents.push(this.depRow());
      }
    }
    this.form.patchValue(this.initial);
    this.showAutofill = this.mode === 'internal';
  }

  private applyLock(): void {
    if (this.locked) {
      this.form.disable({ emitEvent: false });
    } else {
      this.form.enable({ emitEvent: false });
    }
  }

  onSaveDraft(): void {
    this.saveDraft.emit(this.form.getRawValue());
  }

  onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }
    this.submitted.emit(this.form.getRawValue());
  }

  onDownload(): void {
    const value = this.form.getRawValue();
    this.pdf.downloadProfile(value);
    this.downloaded.emit(value);
  }

  invalid(path: string): boolean {
    const c = this.form.get(path);
    return !!c && c.invalid && (c.touched || c.dirty);
  }
}
