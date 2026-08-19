/**
 * Estilo visual do botão de ação.
 * - 'outlined': borda com fundo transparente
 * - 'filled': fundo preenchido (destaque)
 */
export type ActionStyle = 'outlined' | 'filled';

/**
 * Configuração de um botão de ação.
 */
export interface ActionConfig {
  /** Identificador único da ação (emitido no evento de clique) */
  key: string;
  /** Texto exibido no botão */
  label: string;
  /** Ícone Material opcional */
  icon?: string;
  /** Estilo do botão */
  style?: ActionStyle;
  /** Se o botão está desabilitado */
  disabled?: boolean;
}
