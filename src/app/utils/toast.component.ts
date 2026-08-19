import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { UtilsProvider } from './utils.provider';

@Component({
  selector: 'app-toast',
  imports: [MatIconModule],
  template: `
    <div class="toast-container">
      @for (toast of utils.toasts(); track toast.id) {
        <div class="toast-item" [class]="'toast-' + toast.type" role="alert" aria-live="polite">
          <mat-icon class="toast-icon" aria-hidden="true">{{ getIcon(toast.type) }}</mat-icon>
          <div class="toast-content">
            <span class="toast-title">{{ toast.title }}</span>
            <span class="toast-message">{{ toast.message }}</span>
          </div>
          <button class="toast-close" (click)="utils.dismissToast(toast.id)" aria-label="Fechar notificação">
            <mat-icon aria-hidden="true">close</mat-icon>
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 16px;
      right: 16px;
      z-index: 3000;
      display: flex;
      flex-direction: column;
      gap: 8px;
      max-width: 400px;
    }

    .toast-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 16px;
      border-radius: 6px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      animation: slideIn 0.3s ease;
      color: #ffffff;
      font-size: 13px;
    }

    .toast-success { background-color: #00695c; }
    .toast-error { background-color: #d32f2f; }
    .toast-warning { background-color: #f57c00; }
    .toast-info { background-color: #1565c0; }

    .toast-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .toast-content {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .toast-title {
      font-weight: 600;
      font-size: 13px;
    }

    .toast-message {
      font-size: 12px;
      opacity: 0.9;
    }

    .toast-close {
      background: none;
      border: none;
      color: #ffffff;
      cursor: pointer;
      padding: 2px;
      opacity: 0.8;

      &:hover { opacity: 1; }

      mat-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
      }
    }

    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `],
})
export class ToastComponent {
  utils = inject(UtilsProvider);

  getIcon(type: string): string {
    switch (type) {
      case 'success': return 'check_circle';
      case 'error': return 'error';
      case 'warning': return 'warning';
      case 'info': return 'info';
      default: return 'info';
    }
  }
}
