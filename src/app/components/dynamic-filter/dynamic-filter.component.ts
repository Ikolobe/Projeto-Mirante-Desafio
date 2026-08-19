import { Component, input, output, signal, ChangeDetectionStrategy, OnInit, inject, DestroyRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { BsDatepickerModule, BsLocaleService } from 'ngx-bootstrap/datepicker';
import { CurrencyMaskDirective } from './currency-mask.directive';
import { FilterConfig, FilterValues, RangeFilterConfig, CustomFilterValidator } from './filter.model';

interface RangeError {
  key: string;
  message: string;
}

@Component({
  selector: 'app-dynamic-filter',
  imports: [
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    BsDatepickerModule,
    CurrencyMaskDirective,
  ],
  templateUrl: './dynamic-filter.component.html',
  styleUrl: './dynamic-filter.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DynamicFilter implements OnInit {
  /** Título da seção de filtros */
  title = input<string>('Filtros');

  /** Subtítulo descritivo */
  subtitle = input<string>('');

  /** Configuração dos filtros a serem renderizados */
  filters = input.required<FilterConfig[]>();

  /** Estado de expansão do painel */
  expanded = input<boolean>(true);

  /** Validadores customizados enviados pelo componente pai */
  customValidators = input<CustomFilterValidator[]>([]);

  /** Evento emitido ao clicar em Pesquisar */
  search = output<FilterValues>();

  /** Tempo de debounce para validação em ms */
  debounceMs = input<number>(300);

  form!: FormGroup;
  isExpanded = true;
  rangeErrors = signal<RangeError[]>([]);
  hasErrors = signal(false);

  private fb = inject(FormBuilder);
  private localeService = inject(BsLocaleService);
  private destroyRef = inject(DestroyRef);

  /** Configuração do bsDatepicker para formato dia */
  dpDayConfig = { dateInputFormat: 'DD/MM/YYYY', containerClass: 'theme-green', showWeekNumbers: false };
  /** Configuração do bsDatepicker para formato mês */
  dpMonthConfig = { dateInputFormat: 'MM/YYYY', minMode: 'month' as const, containerClass: 'theme-green', showWeekNumbers: false };
  /** Configuração do bsDatepicker para formato ano */
  dpYearConfig = { dateInputFormat: 'YYYY', minMode: 'year' as const, containerClass: 'theme-green', showWeekNumbers: false };

  ngOnInit(): void {
    this.localeService.use('pt-br');
    this.isExpanded = this.expanded();
    this.buildForm();

    // Valida ranges com debounce para evitar excesso de processamento
    this.form.valueChanges.pipe(
      debounceTime(this.debounceMs()),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => this.validateRanges());
  }

  toggleExpanded(): void {
    this.isExpanded = !this.isExpanded;
  }

  onSearch(): void {
    this.validateRanges();
    if (!this.hasErrors()) {
      this.search.emit(this.form.getRawValue());
    }
  }

  onReset(): void {
    this.form.reset();
    this.rangeErrors.set([]);
    this.hasErrors.set(false);
  }

  isRange(filter: FilterConfig): filter is RangeFilterConfig {
    return filter.type === 'range';
  }

  getDateConfig(filter: FilterConfig): object {
    switch (filter.dateMode) {
      case 'month': return this.dpMonthConfig;
      case 'year': return this.dpYearConfig;
      default: return this.dpDayConfig;
    }
  }

  getRangeError(key: string): string | null {
    const error = this.rangeErrors().find((e) => e.key === key);
    return error ? error.message : null;
  }

  private validateRanges(): void {
    const errors: RangeError[] = [];
    const values = this.form.getRawValue();

    for (const filter of this.filters()) {
      if (filter.type !== 'range') continue;

      const fromValue = this.form.get(`${filter.key}_from`)?.value;
      const toValue = this.form.get(`${filter.key}_to`)?.value;

      const hasFrom = fromValue !== null && fromValue !== '' && fromValue !== undefined;
      const hasTo = toValue !== null && toValue !== '' && toValue !== undefined;

      // Validação: se preencher um, deve preencher o outro
      if (hasFrom && !hasTo) {
        errors.push({ key: filter.key, message: `Preencha o valor final de "${filter.label}"` });
      } else if (!hasFrom && hasTo) {
        errors.push({ key: filter.key, message: `Preencha o valor inicial de "${filter.label}"` });
      }

      // Validação: final não pode ser menor que o inicial
      if (hasFrom && hasTo) {
        const rangeFilter = filter as RangeFilterConfig;
        if (rangeFilter.rangeType === 'date') {
          const dateFrom = fromValue instanceof Date ? fromValue : new Date(fromValue);
          const dateTo = toValue instanceof Date ? toValue : new Date(toValue);
          if (dateTo < dateFrom) {
            errors.push({ key: filter.key, message: `Data final não pode ser anterior à inicial em "${filter.label}"` });
          }
        } else {
          const numFrom = Number(fromValue);
          const numTo = Number(toValue);
          if (!isNaN(numFrom) && !isNaN(numTo) && numTo < numFrom) {
            errors.push({ key: filter.key, message: `Valor final não pode ser menor que o inicial em "${filter.label}"` });
          }
        }
      }
    }

    // Custom validators do componente pai
    for (const validator of this.customValidators()) {
      const message = validator.validate(values);
      if (message) {
        errors.push({ key: 'custom', message });
      }
    }

    // Validação de datas inválidas (campos date e range date)
    for (const filter of this.filters()) {
      if (filter.type === 'date') {
        const val = this.form.get(filter.key)?.value;
        if (val && !(val instanceof Date && !isNaN(val.getTime()))) {
          if (typeof val === 'string' && val.trim() !== '') {
            errors.push({ key: filter.key, message: `Data inválida em "${filter.label}"` });
          }
        }
      }
      if (filter.type === 'range' && (filter as RangeFilterConfig).rangeType === 'date') {
        const fromVal = this.form.get(`${filter.key}_from`)?.value;
        const toVal = this.form.get(`${filter.key}_to`)?.value;
        if (fromVal && !(fromVal instanceof Date && !isNaN(fromVal.getTime()))) {
          if (typeof fromVal === 'string' && fromVal.trim() !== '') {
            errors.push({ key: `${filter.key}_from`, message: `Data inicial inválida em "${filter.label}"` });
          }
        }
        if (toVal && !(toVal instanceof Date && !isNaN(toVal.getTime()))) {
          if (typeof toVal === 'string' && toVal.trim() !== '') {
            errors.push({ key: `${filter.key}_to`, message: `Data final inválida em "${filter.label}"` });
          }
        }
      }
    }

    this.rangeErrors.set(errors);
    this.hasErrors.set(errors.length > 0);
  }

  private buildForm(): void {
    const group: Record<string, unknown> = {};

    for (const filter of this.filters()) {
      if (filter.type === 'range') {
        group[`${filter.key}_from`] = [filter.defaultValue ?? ''];
        group[`${filter.key}_to`] = [filter.defaultValue ?? ''];
      } else {
        group[filter.key] = [filter.defaultValue ?? ''];
      }
    }

    this.form = this.fb.group(group);
  }
}
