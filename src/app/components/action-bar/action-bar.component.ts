import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ActionConfig } from './action-bar.model';

@Component({
  selector: 'app-action-bar',
  imports: [MatIconModule],
  templateUrl: './action-bar.component.html',
  styleUrl: './action-bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActionBar {
  /** Lista de ações a serem renderizadas */
  actions = input.required<ActionConfig[]>();

  /** Evento emitido ao clicar em uma ação */
  actionClick = output<string>();

  onAction(key: string): void {
    this.actionClick.emit(key);
  }
}
