import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AuthSession } from '@supabase/supabase-js';

import { SupabaseService } from './supabase.service';
import { Profile } from '@core/models/profile.model';
import { UserRole } from '@core/models/user-role.enum';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _session$ = new BehaviorSubject<AuthSession | null>(null);
  private readonly _profile$ = new BehaviorSubject<Profile | null>(null);

  readonly session$ = this._session$.asObservable();
  readonly profile$ = this._profile$.asObservable();

  /** Resolves once the initial session has been determined. Guards await this. */
  readonly ready: Promise<void>;

  constructor(private readonly sb: SupabaseService) {
    this.ready = this.sb.client.auth.getSession().then(async ({ data }) => {
      this._session$.next(data.session);
      if (data.session) {
        await this.refreshProfile();
      }
    });

    this.sb.client.auth.onAuthStateChange((_event, session) => {
      this._session$.next(session);
      if (session) {
        void this.refreshProfile();
      } else {
        this._profile$.next(null);
      }
    });
  }

  get session(): AuthSession | null {
    return this._session$.value;
  }
  get profile(): Profile | null {
    return this._profile$.value;
  }
  get isAuthenticated(): boolean {
    return !!this._session$.value;
  }
  get role(): UserRole | null {
    return this._profile$.value?.role ?? null;
  }
  get userId(): string | null {
    return this._session$.value?.user?.id ?? null;
  }

  async signIn(email: string, password: string): Promise<void> {
    const { error } = await this.sb.client.auth.signInWithPassword({
      email,
      password
    });
    if (error) {
      throw error;
    }
    await this.refreshProfile();
  }

  async signUp(
    email: string,
    password: string,
    fullName: string
  ): Promise<{ needsConfirmation: boolean }> {
    const { data, error } = await this.sb.client.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } }
    });
    if (error) {
      throw error;
    }

    // The DB trigger `handle_new_user` creates the profile row. If a session is
    // already active (email confirmation disabled) we make sure the name is set.
    if (data.session && data.user) {
      try {
        await this.sb.client
          .from('profiles')
          .update({ full_name: fullName, email })
          .eq('id', data.user.id);
        await this.refreshProfile();
      } catch (e) {
        console.warn('profile post-signup update skipped', e);
      }
    }

    return { needsConfirmation: !data.session };
  }

  async signOut(): Promise<void> {
    await this.sb.client.auth.signOut();
    this._profile$.next(null);
  }

  async refreshProfile(): Promise<Profile | null> {
    const uid =
      this._session$.value?.user?.id ??
      (await this.sb.client.auth.getUser()).data.user?.id;
    if (!uid) {
      this._profile$.next(null);
      return null;
    }
    const { data, error } = await this.sb.client
      .from('profiles')
      .select('*')
      .eq('id', uid)
      .single();
    if (error) {
      console.warn('Could not load profile:', error.message);
      return null;
    }
    this._profile$.next(data as Profile);
    return data as Profile;
  }

  /** Convenience: the landing route to send a user to after login. */
  homeRouteForRole(role: UserRole | null): string {
    return role === UserRole.Preparer || role === UserRole.Admin
      ? '/preparer'
      : '/client';
  }
}
