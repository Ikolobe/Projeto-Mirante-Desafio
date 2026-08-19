/**
 * Tipos de filtro suportados pelo componente dinâmico.
 */
export type FilterType = 'text' | 'textarea' | 'date' | 'monetary' | 'number' | 'range';

/**
 * Modo de exibição do datepicker (bsDatepicker minMode).
 * - 'day': seleciona dia completo (dd/mm/yyyy)
 * - 'month': seleciona apenas mês/ano
 * - 'year': seleciona apenas ano
 */
export type DateMode = 'day' | 'month' | 'year';

/**
 * Configuração base de um filtro.
 */
export interface FilterConfig {
  /** Identificador único do campo */
  key: string;
  /** Label exibida acima do campo */
  label: string;
  /** Tipo do filtro */
  type: FilterType;
  /** Placeholder do campo */
  placeholder?: string;
  /** Valor padrão */
  defaultValue?: unknown;
  /** Largura do campo no grid Bootstrap (1-12 colunas) */
  colSpan?: number;
  /** Se o campo é obrigatório */
  required?: boolean;
  /** Opções para select/dropdown */
  options?: FilterOption[];
  /** Modo do datepicker (apenas para type 'date') */
  dateMode?: DateMode;
}

/**
 * Opção para campos do tipo select.
 */
export interface FilterOption {
  value: string | number;
  label: string;
}

/**
 * Configuração específica para filtros do tipo range.
 * Gera dois campos (De/Até) com o subType definido.
 */
export interface RangeFilterConfig extends FilterConfig {
  type: 'range';
  /** Tipo dos campos internos do range */
  rangeType: 'date' | 'monetary' | 'text' | 'number';
  /** Modo do datepicker (apenas para rangeType 'date') */
  dateMode?: DateMode;
  /** Placeholder do campo "De" */
  placeholderFrom?: string;
  /** Placeholder do campo "Até" */
  placeholderTo?: string;
}

/**
 * Valores emitidos pelo componente de filtros.
 */
export type FilterValues = Record<string, unknown>;
