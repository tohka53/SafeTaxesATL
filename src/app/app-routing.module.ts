import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { authGuard } from '@core/guards/auth.guard';
import { roleGuard } from '@core/guards/role.guard';
import { UserRole } from '@core/models/user-role.enum';

const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('./features/landing/landing.module').then((m) => m.LandingModule)
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.module').then((m) => m.AuthModule)
  },
  {
    path: 'client',
    canActivate: [authGuard, roleGuard],
    data: { roles: [UserRole.Client, UserRole.Preparer, UserRole.Admin] },
    loadChildren: () =>
      import('./features/client/client.module').then((m) => m.ClientModule)
  },
  {
    path: 'preparer',
    canActivate: [authGuard, roleGuard],
    data: { roles: [UserRole.Preparer, UserRole.Admin] },
    loadChildren: () =>
      import('./features/preparer/preparer.module').then((m) => m.PreparerModule)
  },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'top' })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
