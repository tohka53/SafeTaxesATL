import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ShellComponent } from '@shared/components/shell/shell.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { FormsComponent } from './pages/forms/forms.component';
import { FormEditorComponent } from './pages/form-editor/form-editor.component';
import { StatusComponent } from './pages/status/status.component';

const routes: Routes = [
  {
    path: '',
    component: ShellComponent,
    children: [
      { path: '', component: DashboardComponent },
      { path: 'profile', component: ProfileComponent },
      { path: 'forms', component: FormsComponent },
      { path: 'forms/new', redirectTo: 'forms', pathMatch: 'full' },
      { path: 'forms/new/:type', component: FormEditorComponent },
      { path: 'forms/:id', component: FormEditorComponent },
      { path: 'status', component: StatusComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClientRoutingModule {}
