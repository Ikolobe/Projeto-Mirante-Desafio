import { Component, input, output, computed, signal, effect, ChangeDetectionStrategy } from '@angular/core';
import { DatePipe, CurrencyPipe, DecimalPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { TableConfig, ColumnConfig, PageChangeEvent } from './data-table.model';

@Component({
  selector: 'app-data-table',
  imports: [DatePipe, CurrencyPipe, DecimalPipe, MatIconModule],
  templateUrl: './data-table.html',
  styleUrl: './data-table.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataTable {
  /** Configuração da tabela */
  config = input.required<TableConfig>();

  /** Dados a serem exibidos */
  data = input.required<Record<string, unknown>[]>();

  /** Evento emitido ao selecionar linhas */
  selectionChange = output<Record<string, unknown>[]>();

  /** Evento emitido ao mudar de página */
  pageChange = output<PageChangeEvent>();

  /** Linhas selecionadas */
  selectedRows = signal<Set<number>>(new Set());

  /** Página atual */
  currentPage = signal(1);

  constructor() {
    // Limpa a seleção quando os dados mudam
    effect(() => {
      this.data();
      this.selectedRows.set(new Set());
    });
  }

  /** Coluna de ordenação atual */
  sortColumn = signal<string>('');

  /** Direção da ordenação */
  sortDirection = signal<'asc' | 'desc' | ''>('');

  /** Dados ordenados */
  sortedData = computed(() => {
    const col = this.sortColumn();
    const dir = this.sortDirection();
    const rawData = [...this.data()];

    if (!col || !dir) return rawData;

    return rawData.sort((a, b) => {
      const valA = a[col];
      const valB = b[col];

      if (valA == null && valB == null) return 0;
      if (valA == null) return dir === 'asc' ? -1 : 1;
      if (valB == null) return dir === 'asc' ? 1 : -1;

      if (valA instanceof Date && valB instanceof Date) {
        return dir === 'asc' ? valA.getTime() - valB.getTime() : valB.getTime() - valA.getTime();
      }

      if (typeof valA === 'number' && typeof valB === 'number') {
        return dir === 'asc' ? valA - valB : valB - valA;
      }

      const strA = String(valA).toLowerCase();
      const strB = String(valB).toLowerCase();
      const cmp = strA.localeCompare(strB);
      return dir === 'asc' ? cmp : -cmp;
    });
  });

  /** Total de páginas */
  totalPages = computed(() => {
    const pagination = this.config().pagination;
    if (!pagination?.enabled) return 1;
    return Math.ceil(this.sortedData().length / pagination.pageSize) || 1;
  });

  /** Dados paginados */
  paginatedData = computed(() => {
    const pagination = this.config().pagination;
    if (!pagination?.enabled) return this.sortedData();
    const start = (this.currentPage() - 1) * pagination.pageSize;
    return this.sortedData().slice(start, start + pagination.pageSize);
  });

  /** Array de páginas para paginação */
  pages = computed(() => {
    const total = this.totalPages();
    return Array.from({ length: total }, (_, i) => i + 1);
  });

  /** Se todas as linhas estão selecionadas */
  allSelected = computed(() => {
    const data = this.paginatedData();
    return data.length > 0 && this.selectedRows().size === data.length;
  });

  toggleSort(column: ColumnConfig): void {
    if (column.sortable === false) return;

    const currentCol = this.sortColumn();
    const currentDir = this.sortDirection();

    if (currentCol === column.key) {
      // Ciclo: asc -> desc -> sem ordenação
      if (currentDir === 'asc') {
        this.sortDirection.set('desc');
      } else {
        this.sortColumn.set('');
        this.sortDirection.set('');
      }
    } else {
      this.sortColumn.set(column.key);
      this.sortDirection.set('asc');
    }
    this.currentPage.set(1);
  }

  getSortIcon(column: ColumnConfig): string {
    if (this.sortColumn() !== column.key) return 'unfold_more';
    return this.sortDirection() === 'asc' ? 'arrow_upward' : 'arrow_downward';
  }

  toggleAll(): void {
    if (this.allSelected()) {
      this.selectedRows.set(new Set());
    } else {
      const all = new Set(this.paginatedData().map((_, i) => i));
      this.selectedRows.set(all);
    }
    this.emitSelection();
  }

  toggleRow(index: number): void {
    const current = new Set(this.selectedRows());
    if (current.has(index)) {
      current.delete(index);
    } else {
      current.add(index);
    }
    this.selectedRows.set(current);
    this.emitSelection();
  }

  isSelected(index: number): boolean {
    return this.selectedRows().has(index);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
    this.selectedRows.set(new Set());
    const pagination = this.config().pagination;
    if (pagination) {
      this.pageChange.emit({ page, pageSize: pagination.pageSize });
    }
  }

  getCellValue(row: Record<string, unknown>, column: ColumnConfig): unknown {
    return row[column.key];
  }

  $any(value: unknown): any {
    return value;
  }

  private emitSelection(): void {
    const data = this.paginatedData();
    const selected = Array.from(this.selectedRows()).map((i) => data[i]);
    this.selectionChange.emit(selected);
  }
}
