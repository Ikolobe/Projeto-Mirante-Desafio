import { Component } from '@angular/core';
import { DynamicFilter } from '../../components/dynamic-filter/dynamic-filter';
import { FilterConfig, FilterValues, RangeFilterConfig } from '../../components/dynamic-filter/filter.model';

@Component({
  selector: 'app-contabil',
  imports: [DynamicFilter],
  templateUrl: './contabil.html',
  styleUrl: './contabil.scss',
})
export class Contabil {
  filters: FilterConfig[] = [
    {
      key: 'instituicaoResp',
      label: 'Instituição Resp.',
      type: 'text',
      placeholder: '0001 - SICOOB',
      colSpan: 6,
    },
    {
      key: 'idLote',
      label: 'ID Lote',
      type: 'range',
      rangeType: 'text',
      placeholderFrom: 'ID Inicial',
      placeholderTo: 'ID Final',
      colSpan: 6,
    } as RangeFilterConfig,
    {
      key: 'instituicao',
      label: 'Instituição',
      type: 'text',
      placeholder: '0002 - SICOOB CENTRAL',
      colSpan: 6,
    },
    {
      key: 'valorLote',
      label: 'Valor Lote',
      type: 'range',
      rangeType: 'monetary',
      placeholderFrom: 'Valor Mínimo',
      placeholderTo: 'Valor Máximo',
      colSpan: 6,
    } as RangeFilterConfig,
    {
      key: 'situacaoLote',
      label: 'Situação Lote',
      type: 'text',
      placeholder: 'TODAS',
      colSpan: 6,
    },
    {
      key: 'dataEntrada',
      label: 'Data Entrada',
      type: 'range',
      rangeType: 'date',
      dateMode: 'day',
      placeholderFrom: 'Período Inicial',
      placeholderTo: 'Período Final',
      colSpan: 6,
    } as RangeFilterConfig,
  ];

  onSearch(values: FilterValues): void {
    console.log('Filtros aplicados:', values);
  }
}
