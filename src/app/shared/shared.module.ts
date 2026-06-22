import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { LanguageSwitcherComponent } from './components/language-switcher/language-switcher.component';
import { TaxFormComponent } from './components/tax-form/tax-form.component';
import { ProcessStepperComponent } from './components/process-stepper/process-stepper.component';
import { ClientProfileFormComponent } from './components/client-profile-form/client-profile-form.component';
import { ShellComponent } from './components/shell/shell.component';
import { DynamicFormComponent } from './components/dynamic-form/dynamic-form.component';

const SHARED_COMPONENTS = [
  NavbarComponent,
  FooterComponent,
  LanguageSwitcherComponent,
  TaxFormComponent,
  ProcessStepperComponent,
  ClientProfileFormComponent,
  ShellComponent,
  DynamicFormComponent
];

@NgModule({
  declarations: [...SHARED_COMPONENTS],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule
  ],
  exports: [
    ...SHARED_COMPONENTS,
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule
  ]
})
export class SharedModule {}
