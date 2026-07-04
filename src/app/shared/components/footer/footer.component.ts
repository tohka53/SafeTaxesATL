import { Component } from '@angular/core';

import { environment } from '@env/environment';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html'
})
export class FooterComponent {
  readonly year = new Date().getFullYear();
  readonly brandName = environment.brandName;
  readonly brandInitials = environment.brandInitials;
}
