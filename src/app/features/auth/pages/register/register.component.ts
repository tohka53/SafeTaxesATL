import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html'
})
export class RegisterComponent {
  form: FormGroup;
  loading = false;
  error = '';
  needsConfirmation = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly auth: AuthService,
    private readonly router: Router,
    private readonly translate: TranslateService
  ) {
    this.form = this.fb.group({
      full_name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  invalid(control: string): boolean {
    const c = this.form.get(control);
    return !!c && c.invalid && (c.touched || c.dirty);
  }

  async onSubmit(): Promise<void> {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }
    this.loading = true;
    this.error = '';
    const { full_name, email, password } = this.form.getRawValue();
    try {
      const { needsConfirmation } = await this.auth.signUp(
        email,
        password,
        full_name
      );
      this.needsConfirmation = needsConfirmation;
      if (!needsConfirmation) {
        await this.router.navigateByUrl('/client');
      }
    } catch (e: unknown) {
      const msg = (e as { message?: string })?.message;
      this.error = msg || this.translate.instant('auth.genericError');
    } finally {
      this.loading = false;
    }
  }
}
