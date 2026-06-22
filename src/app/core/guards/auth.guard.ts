import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '@core/services/auth.service';

/** Blocks routes for anonymous users; waits for the session to be resolved. */
export const authGuard: CanActivateFn = async (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  await auth.ready;

  if (auth.isAuthenticated) {
    return true;
  }
  return router.createUrlTree(['/auth/login'], {
    queryParams: { redirect: state.url }
  });
};
