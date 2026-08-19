import { Component, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-modal-justificativa',
  imports: [FormsModule, MatIconModule],
  templateUrl: './modal-justificativa.html',
  styleUrl: './modal-justificativa.scss',
})
export class ModalJustificativa {
  /** Título da modal */
  title = input<string>('Justificativa');

  /** Se é modo readonly (visualização) */
  readonly = input<boolean>(false);

  /** Texto da justificativa (para visualização) */
  text = input<string>('');

  /** Evento emitido ao confirmar com o texto da justificativa */
  confirm = output<string>();

  /** Evento emitido ao fechar */
  close = output<void>();

  justificativa = signal('');

  ngOnInit(): void {
    if (this.text()) {
      this.justificativa.set(this.text());
    }
  }

  onConfirm(): void {
    if (this.justificativa().trim()) {
      this.confirm.emit(this.justificativa());
    }
  }

  onCancel(): void {
    this.close.emit();
  }
}
