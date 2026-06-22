import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent {
  form: FormGroup;
  loading = false;
  error = '';
  private readonly redirect: string;

  constructor(
    private readonly fb: FormBuilder,
    private readonly auth: AuthService,
    private readonly router: Router,
    route: ActivatedRoute,
    private readonly translate: TranslateService
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
    this.redirect = route.snapshot.queryParamMap.get('redirect') ?? '';
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
    const { email, password } = this.form.getRawValue();
    try {
      await this.auth.signIn(email, password);
      const target = this.redirect || this.auth.homeRouteForRole(this.auth.role);
      await this.router.navigateByUrl(target);
    } catch (e: unknown) {
      const msg = (e as { message?: string })?.message ?? '';
      this.error = /invalid|credentials/i.test(msg)
        ? this.translate.instant('auth.invalidCredentials')
        : this.translate.instant('auth.genericError');
    } finally {
      this.loading = false;
    }
  }
}
