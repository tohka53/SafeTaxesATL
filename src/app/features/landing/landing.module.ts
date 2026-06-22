import { NgModule } from '@angular/core';

import { SharedModule } from '@shared/shared.module';
import { LandingRoutingModule } from './landing-routing.module';
import { HomeComponent } from './pages/home/home.component';
import { ContactComponent } from './pages/contact/contact.component';
import { IntakeComponent } from './pages/intake/intake.component';
import { PublicFormComponent } from './pages/public-form/public-form.component';

@NgModule({
  declarations: [
    HomeComponent,
    ContactComponent,
    IntakeComponent,
    PublicFormComponent
  ],
  imports: [SharedModule, LandingRoutingModule]
})
export class LandingModule {}
