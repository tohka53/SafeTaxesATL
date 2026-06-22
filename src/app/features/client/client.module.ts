import { NgModule } from '@angular/core';

import { SharedModule } from '@shared/shared.module';
import { ClientRoutingModule } from './client-routing.module';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { FormsComponent } from './pages/forms/forms.component';
import { FormEditorComponent } from './pages/form-editor/form-editor.component';
import { StatusComponent } from './pages/status/status.component';

@NgModule({
  declarations: [
    DashboardComponent,
    ProfileComponent,
    FormsComponent,
    FormEditorComponent,
    StatusComponent
  ],
  imports: [SharedModule, ClientRoutingModule]
})
export class ClientModule {}
