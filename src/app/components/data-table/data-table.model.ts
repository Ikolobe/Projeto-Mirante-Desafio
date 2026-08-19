/**
 * Configuração de uma coluna da tabela.
 */
export interface ColumnConfig {
  /** Identificador da coluna (chave do objeto de dados) */
  key: string;
  /** Label exibida no header */
  label: string;
  /** Classe CSS aplicada na coluna (Bootstrap ou custom) */
  class?: string;
  /** Classe CSS aplicada no header */
  headerClass?: string;
  /** Tipo de formatação da célula */
  type?: 'text' | 'date' | 'currency' | 'number';
  /** Se a coluna é ordenável */
  sortable?: boolean;
  /** Alinhamento do conteúdo */
  align?: 'left' | 'center' | 'right';
}

/**
 * Configuração de paginação.
 */
export interface PaginationConfig {
  /** Se a paginação está habilitada */
  enabled: boolean;
  /** Itens por página */
  pageSize: number;
  /** Página atual (1-indexed) */
  currentPage?: number;
}

/**
 * Configuração completa da tabela.
 */
export interface TableConfig {
  /** Colunas da tabela */
  columns: ColumnConfig[];
  /** Se exibe checkbox de seleção */
  selectable?: boolean;
  /** Configuração de paginação */
  pagination?: PaginationConfig;
  /** Classe CSS aplicada na tabela */
  tableClass?: string;
}

/**
 * Evento de mudança de página.
 */
export interface PageChangeEvent {
  page: number;
  pageSize: number;
}
