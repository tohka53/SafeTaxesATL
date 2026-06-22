import { Directive, ElementRef, HostListener, Optional } from '@angular/core';
import { NgControl } from '@angular/forms';

/** Format any phone string as a US number: (XXX) XXX-XXXX (max 10 digits). */
export function formatUsPhone(value: string | null | undefined): string {
  const d = (value ?? '').replace(/\D/g, '').slice(0, 10);
  const a = d.slice(0, 3);
  const b = d.slice(3, 6);
  const c = d.slice(6, 10);
  if (d.length > 6) {
    return `(${a}) ${b}-${c}`;
  }
  if (d.length > 3) {
    return `(${a}) ${b}`;
  }
  if (d.length > 0) {
    return `(${a}`;
  }
  return '';
}

/** Returns +1XXXXXXXXXX for a US 10-digit number (for sms:/tel:). */
export function usPhoneE164(value: string | null | undefined): string {
  const d = (value ?? '').replace(/\D/g, '');
  if (d.length === 10) {
    return `+1${d}`;
  }
  if (d.length === 11 && d.startsWith('1')) {
    return `+${d}`;
  }
  return (value ?? '').replace(/[^\d+]/g, '');
}

/**
 * Auto-formats an input to US phone format as the user types. Works with both
 * ngModel and formControlName (writes the formatted value back to the control).
 */
@Directive({ selector: '[appUsPhone]' })
export class UsPhoneDirective {
  constructor(
    private readonly el: ElementRef<HTMLInputElement>,
    @Optional() private readonly ngControl: NgControl
  ) {}

  @HostListener('input')
  @HostListener('blur')
  onInput(): void {
    const formatted = formatUsPhone(this.el.nativeElement.value);
    this.el.nativeElement.value = formatted;
    this.ngControl?.control?.setValue(formatted, { emitEvent: false });
  }
}
