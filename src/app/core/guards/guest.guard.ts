import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '@core/services/auth.service';

/** Keeps logged-in users out of the login/register pages: sends them to their CRM. */
export const guestGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  await auth.ready;
  if (auth.isAuthenticated) {
    return router.createUrlTree([auth.homeRouteForRole(auth.role)]);
  }
  return true;
};
