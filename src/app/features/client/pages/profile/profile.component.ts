import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { AuthService } from '@core/services/auth.service';
import { ProfileService } from '@core/services/profile.service';
import { INCOME_RANGES, Profile } from '@core/models/profile.model';
import { US_STATES } from '@core/data/us-states';
import { citiesForState } from '@core/data/us-cities';
import { US_BANKS } from '@core/data/us-banks';

@Component({
  selector: 'app-client-profile',
  templateUrl: './profile.component.html'
})
export class ProfileComponent implements OnInit {
  readonly incomeRanges = INCOME_RANGES;

  form!: FormGroup;
  loading = true;
  saving = false;
  success = false;
  email = '';
  readonly states = US_STATES;
  readonly banks = US_BANKS;

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
    private readonly auth: AuthService,
    private readonly profiles: ProfileService
  ) {}

  async ngOnInit(): Promise<void> {
    this.form = this.fb.group({
      full_name: [''],
      phone: [''],
      address_line1: [''],
      address_line2: [''],
      city: [''],
      state: [''],
      zip: [''],
      ssn: [''],
      bank_name: [''],
      bank_account_number: [''],
      bank_routing_number: [''],
      employer: [''],
      income_range: ['']
    });

    const uid = this.auth.userId;
    if (!uid) {
      this.loading = false;
      return;
    }
    const p: Profile | null = this.auth.profile ?? (await this.profiles.get(uid));
    if (p) {
      this.email = p.email;
      this.form.patchValue(p);
    }
    this.loading = false;
  }

  async onSubmit(): Promise<void> {
    const uid = this.auth.userId;
    if (!uid) {
      return;
    }
    this.saving = true;
    this.success = false;
    try {
      await this.profiles.upsert({ id: uid, ...this.form.getRawValue() });
      await this.auth.refreshProfile();
      this.success = true;
    } catch (e) {
      console.warn('profile save', e);
    } finally {
      this.saving = false;
    }
  }
}
