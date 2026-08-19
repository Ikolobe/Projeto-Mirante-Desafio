import { Injectable, signal } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

// ─── Toast ────────────────────────────────────────────────────────────────────

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: number;
  message: string;
  title: string;
  type: ToastType;
}

// ─── Service ──────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class UtilsProvider {
  // ─── Toast State ────────────────────────────────────────────────────────────
  private nextToastId = 0;
  toasts = signal<ToastMessage[]>([]);

  /**
   * Exibe um toast de sucesso.
   */
  showSuccess(title: string, message: string, duration = 4000): void {
    this.showToast('success', title, message, duration);
  }

  /**
   * Exibe um toast de erro.
   */
  showError(title: string, message: string, duration = 5000): void {
    this.showToast('error', title, message, duration);
  }

  /**
   * Exibe um toast de alerta.
   */
  showWarning(title: string, message: string, duration = 5000): void {
    this.showToast('warning', title, message, duration);
  }

  /**
   * Exibe um toast informativo.
   */
  showInfo(title: string, message: string, duration = 4000): void {
    this.showToast('info', title, message, duration);
  }

  /**
   * Exibe um toast genérico.
   */
  showToast(type: ToastType, title: string, message: string, duration = 4000): void {
    if (!message) return;

    const id = this.nextToastId++;
    this.toasts.update((toasts) => [...toasts, { id, title, message, type }]);

    setTimeout(() => this.dismissToast(id), duration);
  }

  /**
   * Remove um toast pelo ID.
   */
  dismissToast(id: number): void {
    this.toasts.update((toasts) => toasts.filter((t) => t.id !== id));
  }

  // ─── Validators ─────────────────────────────────────────────────────────────

  /**
   * Validator que verifica se o valor é uma data válida.
   * Aceita Date ou string no formato dd/mm/yyyy.
   */
  dateValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;

      if (!value || value === '') return null;

      if (value instanceof Date && !isNaN(value.getTime())) return null;

      if (typeof value === 'string') {
        const parts = value.split('/');
        if (parts.length === 3) {
          const day = parseInt(parts[0], 10);
          const month = parseInt(parts[1], 10) - 1;
          const year = parseInt(parts[2], 10);
          const date = new Date(year, month, day);

          if (date.getFullYear() === year && date.getMonth() === month && date.getDate() === day) {
            return null;
          }
        }
      }

      return { invalidDate: { value } };
    };
  }

  /**
   * Validator para campos monetários (valor maior que zero).
   */
  monetaryGreaterThanZero(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value && value !== 0) return null;

      const num = typeof value === 'string' ? parseFloat(value.replace(/[^\d,.-]/g, '').replace(',', '.')) : value;
      if (isNaN(num) || num <= 0) {
        return { monetaryInvalid: { value } };
      }
      return null;
    };
  }

  /**
   * Validator de intervalo de períodos (data inicial não pode ser após data final).
   */
  validatorIntervalPeriods(keyStart: string, keyEnd: string, errorMessage = 'Intervalo de períodos incorreto'): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const start = control.get(keyStart)?.value;
      const end = control.get(keyEnd)?.value;

      if (start && end) {
        const dateStart = start instanceof Date ? start : new Date(start);
        const dateEnd = end instanceof Date ? end : new Date(end);

        if (dateStart > dateEnd) {
          return { periodsIncorrect: errorMessage };
        }
      }
      return null;
    };
  }

  // ─── Formatação ─────────────────────────────────────────────────────────────

  /**
   * Formata valor monetário em pt-BR.
   */
  monetary(value: number | string | null): string {
    if (value == null || value === '') return '-';

    const num = typeof value === 'string' ? parseFloat(value.replace(',', '.')) : value;
    if (isNaN(num)) return '-';

    return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  /**
   * Formata data para dd/mm/yyyy.
   */
  formatDate(value: Date | string | null): string {
    if (!value) return '-';

    const date = value instanceof Date ? value : new Date(value);
    if (isNaN(date.getTime())) return '-';

    return date.toLocaleDateString('pt-BR');
  }

  /**
   * Capitaliza a primeira letra de uma string.
   */
  capitalize(str: string): string {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Normaliza texto removendo acentos.
   */
  normalizeText(text: string): string {
    if (!text) return '';
    return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }
}
