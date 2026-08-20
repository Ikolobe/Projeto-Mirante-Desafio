import { Component, signal, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DynamicFilter } from '../../components/dynamic-filter/dynamic-filter.component';
import { FilterConfig, FilterValues, RangeFilterConfig } from '../../components/dynamic-filter/filter.model';
import { ActionBar } from '../../components/action-bar/action-bar.component';
import { ActionConfig } from '../../components/action-bar/action-bar.model';
import { DataTable } from '../../components/data-table/data-table.component';
import { TableConfig, PageChangeEvent } from '../../components/data-table/data-table.model';
import { ModalIncluir } from './modal-incluir/modal-incluir.component';
import { ModalJustificativa } from './modal-justificativa/modal-justificativa.component';
import { Loading } from '../../components/loading/loading.component';
import { ContabilService } from './contabil.service';
import { UtilsProvider } from '../../utils/utils.provider';

@Component({
  selector: 'app-contabil',
  imports: [DynamicFilter, ActionBar, DataTable, ModalIncluir, ModalJustificativa, Loading],
  templateUrl: './contabil.component.html',
  styleUrl: './contabil.component.scss',
})
export class ContabilComponent {
  private service = inject(ContabilService);
  private destroyRef = inject(DestroyRef);
  private utils = inject(UtilsProvider);

    constructor() {
    // Subscreve ao estado do service
    this.service.data$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data) => {
      this.tableData.set(data as unknown as Record<string, unknown>[]);
    });

    this.service.loading$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((loading) => {
      this.isLoading.set(loading);
    });
  }

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


  onSearch(values: FilterValues): void {
    this.service.search(values);
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
        const idLote = this.selectedRows[0]['idLote'] as number;
        const justificativa = this.service.getJustificativa(idLote);
        this.justificativaTitle.set('Visualizar Justificativa');
        this.justificativaReadonly.set(true);
        this.justificativaText.set(justificativa);
        this.showJustificativaModal.set(true);
      }
    } else if (key === 'excluir') {
      this.excluirSelecionados();
    }
  }

  onModalSave(data: Record<string, unknown>): void {
    this.showModal.set(false);

    if (this.modalMode() === 'alterar' && this.modalEditData()) {
      const editId = this.modalEditData()!['idLote'] as number;
      this.service.alterar(editId, {
        dataEntrada: data['dataEntrada'] as Date,
        valor: data['valor'] as number,
        quantLancamentos: data['quantLancamentos'] as number,
        usuarioRegistro: data['usuarioRegistro'] as string,
      }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
        this.utils.showSuccess('Sucesso', 'Lote alterado com sucesso!');
      });
    } else {
      this.service.incluir({
        dataEntrada: data['dataEntrada'] as Date,
        valor: data['valor'] as number,
        quantLancamentos: data['quantLancamentos'] as number,
        usuarioRegistro: data['usuarioRegistro'] as string,
      }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
        this.utils.showSuccess('Sucesso', 'Lote incluído com sucesso!');
      });
    }
  }

  onModalClose(): void {
    this.showModal.set(false);
  }

  onJustificativaConfirm(text: string): void {
    this.showJustificativaModal.set(false);
    const situacao = this.pendingSituacao();
    if (situacao && this.selectedRows.length > 0) {
      const ids = this.selectedRows.map((r) => r['idLote'] as number);
      this.service.atualizarSituacao(ids, situacao, text)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => {
          this.selectedRows = [];
          this.resetActions();
          this.utils.showSuccess('Sucesso', `Lote(s) ${situacao.toLowerCase()}(s) com sucesso!`);
        });
    }
  }

  onJustificativaClose(): void {
    this.showJustificativaModal.set(false);
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

  private excluirSelecionados(): void {
    if (this.selectedRows.length === 0) return;
    const ids = this.selectedRows.map((r) => r['idLote'] as number);
    this.service.excluir(ids)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.selectedRows = [];
        this.resetActions();
        this.utils.showSuccess('Sucesso', 'Lote(s) excluído(s) com sucesso!');
      });
  }

  private resetActions(): void {
    this.actions.update((actions) =>
      actions.map((action) => {
        if (action.key === 'incluir') return action;
        return { ...action, disabled: true };
      })
    );
  }
}
