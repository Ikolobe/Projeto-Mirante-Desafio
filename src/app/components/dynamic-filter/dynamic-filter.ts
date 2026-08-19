import { Component, input, output, ChangeDetectionStrategy, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { BsDatepickerModule, BsLocaleService } from 'ngx-bootstrap/datepicker';
import { CurrencyMaskDirective } from './currency-mask.directive';
import { FilterConfig, FilterValues, RangeFilterConfig } from './filter.model';

@Component({
  selector: 'app-dynamic-filter',
  imports: [
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    BsDatepickerModule,
    CurrencyMaskDirective,
  ],
  templateUrl: './dynamic-filter.html',
  styleUrl: './dynamic-filter.scss',
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

  /** Evento emitido ao clicar em Pesquisar */
  search = output<FilterValues>();

  form!: FormGroup;
  isExpanded = true;

  private fb = inject(FormBuilder);
  private localeService = inject(BsLocaleService);

  /** Configuração do bsDatepicker para formato dia */
  dpDayConfig = { dateInputFormat: 'DD/MM/YYYY', containerClass: 'theme-green' };
  /** Configuração do bsDatepicker para formato mês */
  dpMonthConfig = { dateInputFormat: 'MM/YYYY', minMode: 'month' as const, containerClass: 'theme-green' };
  /** Configuração do bsDatepicker para formato ano */
  dpYearConfig = { dateInputFormat: 'YYYY', minMode: 'year' as const, containerClass: 'theme-green' };

  ngOnInit(): void {
    this.localeService.use('pt-br');
    this.isExpanded = this.expanded();
    this.buildForm();
  }

  toggleExpanded(): void {
    this.isExpanded = !this.isExpanded;
  }

  onSearch(): void {
    this.search.emit(this.form.getRawValue());
  }

  onReset(): void {
    this.form.reset();
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
