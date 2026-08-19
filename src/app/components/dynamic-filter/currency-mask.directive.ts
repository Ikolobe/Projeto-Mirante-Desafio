import { Directive, ElementRef, HostListener, forwardRef, inject } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Directive({
  selector: '[appCurrencyMask]',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CurrencyMaskDirective),
      multi: true,
    },
  ],
})
export class CurrencyMaskDirective implements ControlValueAccessor {
  private el = inject(ElementRef);
  private onChange: (value: number | null) => void = () => {};
  private onTouched: () => void = () => {};

  @HostListener('input')
  onInput(): void {
    const value = this.el.nativeElement.value;
    const numericValue = this.parseValue(value);
    this.onChange(numericValue);
    this.el.nativeElement.value = this.formatValue(numericValue);
  }

  @HostListener('blur')
  onBlur(): void {
    this.onTouched();
  }

  writeValue(value: number | null): void {
    this.el.nativeElement.value = this.formatValue(value);
  }

  registerOnChange(fn: (value: number | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  private parseValue(value: string): number | null {
    if (!value) return null;
    const cleaned = value.replace(/[^\d]/g, '');
    if (!cleaned) return null;
    return parseInt(cleaned, 10) / 100;
  }

  private formatValue(value: number | null): string {
    if (value === null || value === undefined) return '';
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  }
}
