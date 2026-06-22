import { NgModule } from '@angular/core';

import { SharedModule } from '@shared/shared.module';
import { PreparerRoutingModule } from './preparer-routing.module';
import { ClientsComponent } from './pages/clients/clients.component';
import { ClientDetailComponent } from './pages/client-detail/client-detail.component';
import { LeadsComponent } from './pages/leads/leads.component';

@NgModule({
  declarations: [ClientsComponent, ClientDetailComponent, LeadsComponent],
  imports: [SharedModule, PreparerRoutingModule]
})
export class PreparerModule {}
