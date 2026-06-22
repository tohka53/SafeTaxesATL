import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '@core/services/auth.service';
import { UserRole } from '@core/models/user-role.enum';

/** Allows the route only when the user's role is listed in route.data.roles. */
export const roleGuard: CanActivateFn = async (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  await auth.ready;
  if (!auth.profile) {
    await auth.refreshProfile();
  }

  const allowed = (route.data?.['roles'] as UserRole[] | undefined) ?? [];
  const role = auth.role;

  if (role && (allowed.length === 0 || allowed.includes(role))) {
    return true;
  }
  // Logged in but wrong role → send home.
  return router.createUrlTree(['/']);
};
