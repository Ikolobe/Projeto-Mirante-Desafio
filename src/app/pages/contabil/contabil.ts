import { Component, signal } from '@angular/core';
import { DynamicFilter } from '../../components/dynamic-filter/dynamic-filter';
import { FilterConfig, FilterValues, RangeFilterConfig } from '../../components/dynamic-filter/filter.model';
import { ActionBar } from '../../components/action-bar/action-bar';
import { ActionConfig } from '../../components/action-bar/action-bar.model';
import { DataTable } from '../../components/data-table/data-table';
import { TableConfig, PageChangeEvent } from '../../components/data-table/data-table.model';
import { ModalIncluir } from './modal-incluir/modal-incluir';
import { ModalJustificativa } from './modal-justificativa/modal-justificativa';
import { Loading } from '../../components/loading/loading';

@Component({
  selector: 'app-contabil',
  imports: [DynamicFilter, ActionBar, DataTable, ModalIncluir, ModalJustificativa, Loading],
  templateUrl: './contabil.html',
  styleUrl: './contabil.scss',
})
export class Contabil {
  filters: FilterConfig[] = [
    {
      key: 'instituicaoResp',
      label: 'Instituição Resp.',
      type: 'text',
      placeholder: 'Digite o código ou nome',
      colSpan: 6,
    },
    {
      key: 'idLote',
      label: 'ID Lote',
      type: 'range',
      rangeType: 'number',
      placeholderFrom: 'ID Inicial',
      placeholderTo: 'ID Final',
      colSpan: 6,
    } as RangeFilterConfig,
    {
      key: 'instituicao',
      label: 'Instituição',
      type: 'text',
      placeholder: 'Digite o código ou nome',
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
      type: 'select',
      placeholder: 'Todas',
      colSpan: 6,
      options: [
        { value: 'Aberto', label: 'Aberto' },
        { value: 'Confirmado', label: 'Confirmado' },
        { value: 'Enviado', label: 'Enviado' },
      ],
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

  actions = signal<ActionConfig[]>([
    { key: 'confirmar', label: 'Confirmar', disabled: true },
    { key: 'enviar', label: 'Enviar', disabled: true },
    { key: 'visualizarJustificativa', label: 'Visualizar Justificativa', disabled: true },
    { key: 'incluir', label: 'Incluir', style: 'filled' },
    { key: 'alterar', label: 'Alterar', disabled: true },
    { key: 'excluir', label: 'Excluir', disabled: true },
    { key: 'visualizar', label: 'Visualizar', disabled: true },
  ]);

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

  tableData = signal<Record<string, unknown>[]>([]);
  isLoading = signal(false);
  showModal = signal(false);
  modalMode = signal<'incluir' | 'alterar' | 'visualizar'>('incluir');
  modalEditData = signal<Record<string, unknown> | null>(null);

  showJustificativaModal = signal(false);
  justificativaReadonly = signal(false);
  justificativaTitle = signal('Justificativa');
  justificativaText = signal('');
  pendingSituacao = signal<string>('');

  private selectedRows: Record<string, unknown>[] = [];

  private allMockData: Record<string, unknown>[] = [
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

  onSearch(values: FilterValues): void {
    this.isLoading.set(true);
    this.tableData.set([]);

    setTimeout(() => {
      let result = [...this.allMockData];

      // Filtro por ID Lote (range)
      const idFrom = values['idLote_from'];
      const idTo = values['idLote_to'];
      if (idFrom) result = result.filter((r) => Number(r['idLote']) >= Number(idFrom));
      if (idTo) result = result.filter((r) => Number(r['idLote']) <= Number(idTo));

      // Filtro por Situação Lote (select)
      const situacao = values['situacaoLote'];
      if (situacao) result = result.filter((r) => r['situacaoLote'] === situacao);

      // Filtro por Valor Lote (range monetário)
      const valorFrom = values['valorLote_from'];
      const valorTo = values['valorLote_to'];
      if (valorFrom) result = result.filter((r) => Number(r['valor']) >= Number(valorFrom));
      if (valorTo) result = result.filter((r) => Number(r['valor']) <= Number(valorTo));

      // Filtro por Data Entrada (range)
      const dataFrom = values['dataEntrada_from'] as Date | null;
      const dataTo = values['dataEntrada_to'] as Date | null;
      if (dataFrom) result = result.filter((r) => (r['dataEntrada'] as Date) >= dataFrom);
      if (dataTo) result = result.filter((r) => (r['dataEntrada'] as Date) <= dataTo);

      this.tableData.set(result);
      this.isLoading.set(false);
    }, 1000);
  }

  onAction(key: string): void {
    if (key === 'incluir') {
      this.modalMode.set('incluir');
      this.modalEditData.set(null);
      this.showModal.set(true);
    } else if (key === 'alterar') {
      if (this.selectedRows.length === 1) {
        this.modalMode.set('alterar');
        this.modalEditData.set(this.selectedRows[0]);
        this.showModal.set(true);
      }
    } else if (key === 'visualizar') {
      if (this.selectedRows.length === 1) {
        this.modalMode.set('visualizar');
        this.modalEditData.set(this.selectedRows[0]);
        this.showModal.set(true);
      }
    } else if (key === 'confirmar') {
      this.pendingSituacao.set('Confirmado');
      this.justificativaTitle.set('Justificativa - Confirmar');
      this.justificativaReadonly.set(false);
      this.justificativaText.set('');
      this.showJustificativaModal.set(true);
    } else if (key === 'enviar') {
      this.pendingSituacao.set('Enviado');
      this.justificativaTitle.set('Justificativa - Enviar');
      this.justificativaReadonly.set(false);
      this.justificativaText.set('');
      this.showJustificativaModal.set(true);
    } else if (key === 'visualizarJustificativa') {
      if (this.selectedRows.length === 1) {
        const justificativa = (this.selectedRows[0]['justificativa'] as string) || 'Sem justificativa registrada.';
        this.justificativaTitle.set('Visualizar Justificativa');
        this.justificativaReadonly.set(true);
        this.justificativaText.set(justificativa);
        this.showJustificativaModal.set(true);
      }
    } else if (key === 'excluir') {
      this.excluirSelecionados();
    } else {
      console.log('Ação:', key);
    }
  }

  onModalSave(data: Record<string, unknown>): void {
    this.showModal.set(false);
    this.isLoading.set(true);

    setTimeout(() => {
      if (this.modalMode() === 'alterar' && this.modalEditData()) {
        const editId = this.modalEditData()!['idLote'];
        const now = new Date();
        const dataHora = `${now.toLocaleDateString('pt-BR')}, ${now.toLocaleTimeString('pt-BR')}`;

        this.tableData.update((rows) =>
          rows.map((row) =>
            row['idLote'] === editId
              ? { ...row, dataEntrada: data['dataEntrada'], valor: data['valor'], quantLancamentos: data['quantLancamentos'], usuarioRegistro: data['usuarioRegistro'], dataHoraSituacao: dataHora }
              : row
          )
        );
      } else {
        const currentData = this.tableData();
        const nextId = currentData.length > 0
          ? Math.max(...currentData.map((r) => Number(r['idLote']) || 0)) + 1
          : 1;

        const now = new Date();
        const dataHora = `${now.toLocaleDateString('pt-BR')}, ${now.toLocaleTimeString('pt-BR')}`;

        this.tableData.update((rows) => [
          ...rows,
          {
            idLote: nextId,
            dataEntrada: data['dataEntrada'],
            valor: data['valor'],
            quantLancamentos: data['quantLancamentos'],
            usuarioRegistro: data['usuarioRegistro'],
            usuarioAprovacao: '',
            situacaoLote: 'Aberto',
            dataHoraSituacao: dataHora,
          },
        ]);
      }

      this.isLoading.set(false);
    }, 1000);
  }

  onModalClose(): void {
    this.showModal.set(false);
  }

  onSelectionChange(rows: Record<string, unknown>[]): void {
    this.selectedRows = rows;
    const count = rows.length;
    this.actions.update((actions) =>
      actions.map((action) => {
        if (action.key === 'incluir') return action;
        if (action.key === 'alterar' || action.key === 'visualizar' || action.key === 'visualizarJustificativa') {
          return { ...action, disabled: count !== 1 };
        }
        return { ...action, disabled: count === 0 };
      })
    );
  }

  onPageChange(event: PageChangeEvent): void {
    console.log('Página:', event);
  }

  onJustificativaConfirm(text: string): void {
    this.showJustificativaModal.set(false);
    const situacao = this.pendingSituacao();
    if (situacao) {
      this.updateSituacao(situacao, text);
    }
  }

  onJustificativaClose(): void {
    this.showJustificativaModal.set(false);
  }

  private excluirSelecionados(): void {
    if (this.selectedRows.length === 0) return;
    const selectedIds = new Set(this.selectedRows.map((r) => r['idLote']));
    this.tableData.update((rows) => rows.filter((row) => !selectedIds.has(row['idLote'])));
    this.selectedRows = [];
  }

  private updateSituacao(situacao: string, justificativa?: string): void {
    if (this.selectedRows.length === 0) return;

    const now = new Date();
    const dataHora = `${now.toLocaleDateString('pt-BR')}, ${now.toLocaleTimeString('pt-BR')}`;
    const selectedIds = new Set(this.selectedRows.map((r) => r['idLote']));

    this.tableData.update((rows) =>
      rows.map((row) =>
        selectedIds.has(row['idLote'])
          ? { ...row, situacaoLote: situacao, usuarioAprovacao: 'usuario_teste', dataHoraSituacao: dataHora, justificativa: justificativa || row['justificativa'] || '' }
          : row
      )
    );
  }
}
