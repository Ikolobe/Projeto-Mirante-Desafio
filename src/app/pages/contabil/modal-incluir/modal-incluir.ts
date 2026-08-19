import { Component, input, output, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { BsDatepickerModule, BsLocaleService } from 'ngx-bootstrap/datepicker';
import { CurrencyMaskDirective } from '../../../components/dynamic-filter/currency-mask.directive';

export type ModalMode = 'incluir' | 'alterar' | 'visualizar';

@Component({
  selector: 'app-modal-incluir',
  imports: [ReactiveFormsModule, MatIconModule, BsDatepickerModule, CurrencyMaskDirective],
  templateUrl: './modal-incluir.html',
  styleUrl: './modal-incluir.scss',
})
export class ModalIncluir implements OnInit {
  /** Modo da modal: incluir, alterar ou visualizar */
  mode = input<ModalMode>('incluir');

  /** Dados do registro para edição/visualização */
  editData = input<Record<string, unknown> | null>(null);

  /** Evento emitido ao salvar com os dados do formulário */
  save = output<Record<string, unknown>>();

  /** Evento emitido ao cancelar/fechar */
  close = output<void>();

  form!: FormGroup;
  dpConfig = { dateInputFormat: 'DD/MM/YYYY', containerClass: 'theme-green' };

  private fb = inject(FormBuilder);
  private localeService = inject(BsLocaleService);

  get isEditMode(): boolean {
    return this.mode() === 'alterar';
  }

  get isViewMode(): boolean {
    return this.mode() === 'visualizar';
  }

  get showReadonlyFields(): boolean {
    return this.mode() === 'alterar' || this.mode() === 'visualizar';
  }

  get title(): string {
    switch (this.mode()) {
      case 'alterar': return 'Alterar Lote';
      case 'visualizar': return 'Visualizar Lote';
      default: return 'Incluir Lote';
    }
  }

  ngOnInit(): void {
    this.localeService.use('pt-br');
    this.form = this.fb.group({
      dataEntrada: ['', Validators.required],
      valor: ['', Validators.required],
      quantLancamentos: ['', Validators.required],
      usuarioRegistro: ['', Validators.required],
    });

    if ((this.isEditMode || this.isViewMode) && this.editData()) {
      const data = this.editData()!;
      this.form.patchValue({
        dataEntrada: data['dataEntrada'],
        valor: data['valor'],
        quantLancamentos: data['quantLancamentos'],
        usuarioRegistro: data['usuarioRegistro'],
      });

      if (this.isViewMode) {
        this.form.disable();
      }
    }
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.save.emit(this.form.getRawValue());
    }
  }

  onCancel(): void {
    this.close.emit();
  }
}
