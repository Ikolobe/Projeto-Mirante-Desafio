import { Component } from '@angular/core';
import { DynamicFilter } from '../../components/dynamic-filter/dynamic-filter';
import { FilterConfig, FilterValues, RangeFilterConfig } from '../../components/dynamic-filter/filter.model';
import { ActionBar } from '../../components/action-bar/action-bar';
import { ActionConfig } from '../../components/action-bar/action-bar.model';
import { DataTable } from '../../components/data-table/data-table';
import { TableConfig, PageChangeEvent } from '../../components/data-table/data-table.model';

@Component({
  selector: 'app-contabil',
  imports: [DynamicFilter, ActionBar, DataTable],
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

  actions: ActionConfig[] = [
    { key: 'confirmar', label: 'Confirmar' },
    { key: 'enviar', label: 'Enviar' },
    { key: 'visualizarJustificativa', label: 'Visualizar Justificativa' },
    { key: 'incluir', label: 'Incluir', style: 'filled' },
    { key: 'alterar', label: 'Alterar' },
    { key: 'excluir', label: 'Excluir' },
    { key: 'visualizar', label: 'Visualizar' },
  ];

  tableConfig: TableConfig = {
    columns: [
      { key: 'idLote', label: 'ID Lote', class: 'col-id' },
      { key: 'dataEntrada', label: 'Data Entrada', type: 'date' },
      { key: 'valor', label: 'Valor', type: 'currency', align: 'right' },
      { key: 'quantLancamentos', label: 'Quant. Lançamentos', type: 'number', align: 'center' },
      { key: 'usuarioRegistro', label: 'Usuário Registro' },
      { key: 'usuarioAprovacao', label: 'Usuário Aprovação' },
      { key: 'situacaoLote', label: 'Situação Lote' },
      { key: 'dataHoraSituacao', label: 'Data/Hora Situação Lote' },
    ],
    selectable: true,
    pagination: {
      enabled: true,
      pageSize: 5,
    },
  };

  tableData: Record<string, unknown>[] = [];

  onSearch(values: FilterValues): void {
    console.log('Filtros aplicados:', values);
    // Mock: simula dados retornados da API
    this.tableData = [
      { idLote: 2, dataEntrada: new Date(2026, 3, 26), valor: 1000.00, quantLancamentos: 1, usuarioRegistro: 'georgc0100_00', usuarioAprovacao: '', situacaoLote: 'Aberto', dataHoraSituacao: '27/04/2026, 12:35:11' },
      { idLote: 3, dataEntrada: new Date(2026, 4, 10), valor: 2500.50, quantLancamentos: 3, usuarioRegistro: 'maria_silva', usuarioAprovacao: 'joao_souza', situacaoLote: 'Confirmado', dataHoraSituacao: '11/05/2026, 08:12:45' },
      { idLote: 4, dataEntrada: new Date(2026, 4, 15), valor: 850.00, quantLancamentos: 2, usuarioRegistro: 'pedro_costa', usuarioAprovacao: '', situacaoLote: 'Aberto', dataHoraSituacao: '16/05/2026, 14:22:03' },
      { idLote: 5, dataEntrada: new Date(2026, 5, 1), valor: 15000.75, quantLancamentos: 8, usuarioRegistro: 'ana_oliveira', usuarioAprovacao: 'carlos_mendes', situacaoLote: 'Enviado', dataHoraSituacao: '02/06/2026, 09:48:30' },
      { idLote: 6, dataEntrada: new Date(2026, 5, 20), valor: 3200.00, quantLancamentos: 4, usuarioRegistro: 'georgc0100_00', usuarioAprovacao: '', situacaoLote: 'Aberto', dataHoraSituacao: '21/06/2026, 16:05:22' },
      { idLote: 7, dataEntrada: new Date(2026, 6, 3), valor: 7800.00, quantLancamentos: 5, usuarioRegistro: 'lucas_ferreira', usuarioAprovacao: 'ana_oliveira', situacaoLote: 'Confirmado', dataHoraSituacao: '04/07/2026, 10:15:00' },
      { idLote: 8, dataEntrada: new Date(2026, 6, 12), valor: 450.25, quantLancamentos: 1, usuarioRegistro: 'fernanda_lima', usuarioAprovacao: '', situacaoLote: 'Aberto', dataHoraSituacao: '13/07/2026, 11:42:18' },
      { idLote: 9, dataEntrada: new Date(2026, 6, 18), valor: 22000.00, quantLancamentos: 12, usuarioRegistro: 'roberto_santos', usuarioAprovacao: 'maria_silva', situacaoLote: 'Enviado', dataHoraSituacao: '19/07/2026, 08:05:33' },
      { idLote: 10, dataEntrada: new Date(2026, 7, 1), valor: 5600.30, quantLancamentos: 6, usuarioRegistro: 'juliana_alves', usuarioAprovacao: '', situacaoLote: 'Aberto', dataHoraSituacao: '02/08/2026, 15:28:47' },
      { idLote: 11, dataEntrada: new Date(2026, 7, 5), valor: 1250.00, quantLancamentos: 2, usuarioRegistro: 'georgc0100_00', usuarioAprovacao: 'pedro_costa', situacaoLote: 'Confirmado', dataHoraSituacao: '06/08/2026, 09:10:55' },
      { idLote: 12, dataEntrada: new Date(2026, 7, 10), valor: 9300.00, quantLancamentos: 7, usuarioRegistro: 'marcos_pereira', usuarioAprovacao: '', situacaoLote: 'Aberto', dataHoraSituacao: '11/08/2026, 13:55:20' },
      { idLote: 13, dataEntrada: new Date(2026, 7, 14), valor: 670.80, quantLancamentos: 1, usuarioRegistro: 'carla_rocha', usuarioAprovacao: 'lucas_ferreira', situacaoLote: 'Enviado', dataHoraSituacao: '15/08/2026, 07:30:12' },
      { idLote: 14, dataEntrada: new Date(2026, 7, 18), valor: 18500.00, quantLancamentos: 10, usuarioRegistro: 'ana_oliveira', usuarioAprovacao: '', situacaoLote: 'Aberto', dataHoraSituacao: '19/08/2026, 14:12:08' },
    ];
  }

  onAction(key: string): void {
    console.log('Ação:', key);
  }

  onSelectionChange(rows: Record<string, unknown>[]): void {
    console.log('Seleção:', rows);
  }

  onPageChange(event: PageChangeEvent): void {
    console.log('Página:', event);
  }
}
