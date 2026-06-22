import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ShellComponent } from '@shared/components/shell/shell.component';
import { roleGuard } from '@core/guards/role.guard';
import { UserRole } from '@core/models/user-role.enum';
import { ClientsComponent } from './pages/clients/clients.component';
import { ClientDetailComponent } from './pages/client-detail/client-detail.component';
import { LeadsComponent } from './pages/leads/leads.component';

const routes: Routes = [
  {
    path: '',
    component: ShellComponent,
    children: [
      { path: '', component: ClientsComponent },
      {
        path: 'leads',
        component: LeadsComponent,
        canActivate: [roleGuard],
        data: { roles: [UserRole.Admin] } // external forms: admin only
      },
      { path: 'clients/:id', component: ClientDetailComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PreparerRoutingModule {}
