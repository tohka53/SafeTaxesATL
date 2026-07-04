import { NgModule } from '@angular/core';

import { SharedModule } from '@shared/shared.module';
import { PreparerRoutingModule } from './preparer-routing.module';
import { ClientsComponent } from './pages/clients/clients.component';
import { ClientDetailComponent } from './pages/client-detail/client-detail.component';
import { LeadsComponent } from './pages/leads/leads.component';
import { ContactsComponent } from './pages/contacts/contacts.component';
import { TemplatesComponent } from './pages/templates/templates.component';
import { FormBuilderComponent } from './pages/form-builder/form-builder.component';

@NgModule({
  declarations: [
    ClientsComponent,
    ClientDetailComponent,
    LeadsComponent,
    ContactsComponent,
    TemplatesComponent,
    FormBuilderComponent
  ],
  imports: [SharedModule, PreparerRoutingModule]
})
export class PreparerModule {}
