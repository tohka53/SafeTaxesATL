import { Component, Input } from '@angular/core';

import {
  TAX_PROCESS_STEPS,
  TaxProcessStatus
} from '@core/models/tax-form.model';

@Component({
  selector: 'app-process-stepper',
  templateUrl: './process-stepper.component.html'
})
export class ProcessStepperComponent {
  @Input() current: TaxProcessStatus | null = null;
  readonly steps = TAX_PROCESS_STEPS;

  get currentIndex(): number {
    return this.current ? this.steps.indexOf(this.current) : -1;
  }

  isDone(i: number): boolean {
    return i <= this.currentIndex;
  }

  isCurrent(i: number): boolean {
    return i === this.currentIndex;
  }
}
