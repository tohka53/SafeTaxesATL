import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '@core/services/auth.service';
import { UserRole } from '@core/models/user-role.enum';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html'
})
export class NavbarComponent {
  readonly UserRole = UserRole;
  mobileOpen = false;

  constructor(
    public readonly auth: AuthService,
    private readonly router: Router
  ) {}

  isStaff(role: UserRole | null): boolean {
    return role === UserRole.Preparer || role === UserRole.Admin;
  }

  async logout(): Promise<void> {
    await this.auth.signOut();
    this.mobileOpen = false;
    void this.router.navigate(['/']);
  }
}
