import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { ProfileService } from '@core/services/profile.service';
import { AuthService } from '@core/services/auth.service';
import { Profile } from '@core/models/profile.model';
import { UserRole } from '@core/models/user-role.enum';
import { encodeId } from '@core/utils/crypto-id';

@Component({
  selector: 'app-preparer-clients',
  templateUrl: './clients.component.html'
})
export class ClientsComponent implements OnInit {
  loading = true;
  clients: Profile[] = [];
  q = '';

  constructor(
    private readonly profiles: ProfileService,
    private readonly router: Router,
    public readonly auth: AuthService
  ) {}

  get isAdmin(): boolean {
    return this.auth.role === UserRole.Admin;
  }

  async ngOnInit(): Promise<void> {
    try {
      this.clients = await this.profiles.listClients();
    } catch (e) {
      console.warn('clients load', e);
    } finally {
      this.loading = false;
    }
  }

  get filtered(): Profile[] {
    const s = this.q.trim().toLowerCase();
    if (!s) {
      return this.clients;
    }
    return this.clients.filter(
      (c) =>
        (c.full_name ?? '').toLowerCase().includes(s) ||
        (c.email ?? '').toLowerCase().includes(s)
    );
  }

  open(client: Profile): void {
    void this.router.navigate(['/preparer/clients', encodeId(client.id)]);
  }
}
