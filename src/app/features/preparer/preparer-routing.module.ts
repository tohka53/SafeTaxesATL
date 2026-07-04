import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ShellComponent } from '@shared/components/shell/shell.component';
import { roleGuard } from '@core/guards/role.guard';
import { UserRole } from '@core/models/user-role.enum';
import { ClientsComponent } from './pages/clients/clients.component';
import { ClientDetailComponent } from './pages/client-detail/client-detail.component';
import { LeadsComponent } from './pages/leads/leads.component';
import { ContactsComponent } from './pages/contacts/contacts.component';
import { TemplatesComponent } from './pages/templates/templates.component';
import { FormBuilderComponent } from './pages/form-builder/form-builder.component';

const routes: Routes = [
  {
    path: '',
    component: ShellComponent,
    children: [
      { path: '', component: ClientsComponent },
      { path: 'contacts', component: ContactsComponent },
      { path: 'templates', component: TemplatesComponent },
      { path: 'form-builder', component: FormBuilderComponent },
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
