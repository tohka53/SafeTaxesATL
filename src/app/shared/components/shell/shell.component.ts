import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '@core/services/auth.service';
import { UserRole } from '@core/models/user-role.enum';

/** Authenticated CRM layout: left sidebar + topbar + routed content. */
@Component({
  selector: 'app-shell',
  templateUrl: './shell.component.html'
})
export class ShellComponent {
  readonly UserRole = UserRole;
  readonly year = new Date().getFullYear();
  sidebarOpen = false;

  constructor(
    public readonly auth: AuthService,
    private readonly router: Router
  ) {}

  isStaff(role: UserRole | null): boolean {
    return role === UserRole.Preparer || role === UserRole.Admin;
  }

  isAdmin(role: UserRole | null): boolean {
    return role === UserRole.Admin;
  }

  async logout(): Promise<void> {
    await this.auth.signOut();
    void this.router.navigate(['/']);
  }
}
