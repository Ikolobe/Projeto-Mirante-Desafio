import { Component, input, output, computed, signal, ChangeDetectionStrategy } from '@angular/core';
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

  /** Total de páginas */
  totalPages = computed(() => {
    const pagination = this.config().pagination;
    if (!pagination?.enabled) return 1;
    return Math.ceil(this.data().length / pagination.pageSize) || 1;
  });

  /** Dados paginados */
  paginatedData = computed(() => {
    const pagination = this.config().pagination;
    if (!pagination?.enabled) return this.data();
    const start = (this.currentPage() - 1) * pagination.pageSize;
    return this.data().slice(start, start + pagination.pageSize);
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
