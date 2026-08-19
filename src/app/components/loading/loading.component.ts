import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-loading',
  template: `
    <div class="loading-overlay">
      <div class="spinner"></div>
    </div>
  `,
  styles: [`
    .loading-overlay {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 48px 0;
    }

    .spinner {
      width: 36px;
      height: 36px;
      border: 4px solid #e0f2f1;
      border-top: 4px solid #00695c;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Loading {}
