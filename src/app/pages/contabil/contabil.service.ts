import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, delay, of, throwError, finalize, catchError, tap } from 'rxjs';
import { FilterValues } from '../../components/dynamic-filter/filter.model';

export interface LoteRecord {
  idLote: number;
  dataEntrada: Date;
  valor: number;
  quantLancamentos: number;
  usuarioRegistro: string;
  usuarioAprovacao: string;
  situacaoLote: string;
  dataHoraSituacao: string;
  justificativa?: string;
}

@Injectable({ providedIn: 'root' })
export class ContabilService {
  /** Estado dos dados */
  private dataSubject = new BehaviorSubject<LoteRecord[]>([]);
  readonly data$ = this.dataSubject.asObservable();

  /** Estado de loading */
  private loadingSubject = new BehaviorSubject<boolean>(false);
  readonly loading$ = this.loadingSubject.asObservable();

  /** Estado de erro */
  private errorSubject = new BehaviorSubject<string | null>(null);
  readonly error$ = this.errorSubject.asObservable();

  /** Dados mock completos (simulando banco de dados) */
  private mockDatabase: LoteRecord[] = [
    { idLote: 2, dataEntrada: new Date(2026, 3, 26), valor: 1000.00, quantLancamentos: 1, usuarioRegistro: 'georgc0100_00', usuarioAprovacao: '', situacaoLote: 'Aberto', dataHoraSituacao: '27/04/2026, 12:35:11' },
    { idLote: 3, dataEntrada: new Date(2026, 4, 10), valor: 2500.50, quantLancamentos: 3, usuarioRegistro: 'maria_silva', usuarioAprovacao: 'joao_souza', situacaoLote: 'Confirmado', dataHoraSituacao: '11/05/2026, 08:12:45' },
    { idLote: 4, dataEntrada: new Date(2026, 4, 15), valor: 850.00, quantLancamentos: 2, usuarioRegistro: 'pedro_costa', usuarioAprovacao: '', situacaoLote: 'Aberto', dataHoraSituacao: '16/05/2026, 14:22:03' },
    { idLote: 5, dataEntrada: new Date(2026, 5, 1), valor: 15000.75, quantLancamentos: 8, usuarioRegistro: 'ana_oliveira', usuarioAprovacao: 'carlos_mendes', situacaoLote: 'Enviado', dataHoraSituacao: '02/06/2026, 09:48:30' },
    { idLote: 6, dataEntrada: new Date(2026, 5, 20), valor: 3200.00, quantLancamentos: 4, usuarioRegistro: 'georgc0100_00', usuarioAprovacao: '', situacaoLote: 'Aberto', dataHoraSituacao: '21/06/2026, 16:05:22' },
    { idLote: 7, dataEntrada: new Date(2026, 6, 3), valor: 7800.00, quantLancamentos: 5, usuarioRegistro: 'lucas_ferreira', usuarioAprovacao: 'ana_oliveira', situacaoLote: 'Confirmado', dataHoraSituacao: '04/07/2026, 10:15:00' },
    { idLote: 8, dataEntrada: new Date(2026, 6, 12), valor: 450.25, quantLancamentos: 1, usuarioRegistro: 'fernanda_lima', usuarioAprovacao: '', situacaoLote: 'Aberto', dataHoraSituacao: '13/07/2026, 11:42:18' },
    { idLote: 9, dataEntrada: new Date(2026, 6, 18), valor: 22000.00, quantLancamentos: 12, usuarioRegistro: 'roberto_santos', usuarioAprovacao: 'maria_silva', situacaoLote: 'Enviado', dataHoraSituacao: '19/07/2026, 08:05:33' },
    { idLote: 10, dataEntrada: new Date(2026, 7, 1), valor: 5600.30, quantLancamentos: 6, usuarioRegistro: 'juliana_alves', usuarioAprovacao: '', situacaoLote: 'Aberto', dataHoraSituacao: '02/08/2026, 15:28:47' },
    { idLote: 11, dataEntrada: new Date(2026, 7, 5), valor: 1250.00, quantLancamentos: 2, usuarioRegistro: 'georgc0100_00', usuarioAprovacao: 'pedro_costa', situacaoLote: 'Confirmado', dataHoraSituacao: '06/08/2026, 09:10:55' },
    { idLote: 12, dataEntrada: new Date(2026, 7, 10), valor: 9300.00, quantLancamentos: 7, usuarioRegistro: 'marcos_pereira', usuarioAprovacao: '', situacaoLote: 'Aberto', dataHoraSituacao: '11/08/2026, 13:55:20' },
    { idLote: 13, dataEntrada: new Date(2026, 7, 14), valor: 670.80, quantLancamentos: 1, usuarioRegistro: 'carla_rocha', usuarioAprovacao: 'lucas_ferreira', situacaoLote: 'Enviado', dataHoraSituacao: '15/08/2026, 07:30:12' },
    { idLote: 14, dataEntrada: new Date(2026, 7, 18), valor: 18500.00, quantLancamentos: 10, usuarioRegistro: 'ana_oliveira', usuarioAprovacao: '', situacaoLote: 'Aberto', dataHoraSituacao: '19/08/2026, 14:12:08' },
  ];

  /** Pesquisar lotes com filtros */
  search(filters: FilterValues): void {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    this.simulateApiCall(() => this.applyFilters(filters)).pipe(
      tap((result) => this.dataSubject.next(result)),
      catchError((err) => {
        this.errorSubject.next(err.message || 'Erro ao buscar dados');
        return of([]);
      }),
      finalize(() => this.loadingSubject.next(false))
    ).subscribe();
  }

  /** Incluir novo lote */
  incluir(data: Partial<LoteRecord>): Observable<LoteRecord> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    const nextId = this.getNextId();
    const now = new Date();
    const newRecord: LoteRecord = {
      idLote: nextId,
      dataEntrada: data.dataEntrada!,
      valor: data.valor!,
      quantLancamentos: data.quantLancamentos!,
      usuarioRegistro: data.usuarioRegistro!,
      usuarioAprovacao: '',
      situacaoLote: 'Aberto',
      dataHoraSituacao: `${now.toLocaleDateString('pt-BR')}, ${now.toLocaleTimeString('pt-BR')}`,
    };

    return this.simulateApiCall(() => {
      this.mockDatabase.push(newRecord);
      this.dataSubject.next([...this.mockDatabase]);
      return newRecord;
    }).pipe(
      catchError((err) => {
        this.errorSubject.next(err.message || 'Erro ao incluir lote');
        return throwError(() => err);
      }),
      finalize(() => this.loadingSubject.next(false))
    );
  }

  /** Alterar lote existente */
  alterar(idLote: number, data: Partial<LoteRecord>): Observable<LoteRecord> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.simulateApiCall(() => {
      const now = new Date();
      const index = this.mockDatabase.findIndex((r) => r.idLote === idLote);
      if (index === -1) throw new Error('Lote não encontrado');

      this.mockDatabase[index] = {
        ...this.mockDatabase[index],
        dataEntrada: data.dataEntrada ?? this.mockDatabase[index].dataEntrada,
        valor: data.valor ?? this.mockDatabase[index].valor,
        quantLancamentos: data.quantLancamentos ?? this.mockDatabase[index].quantLancamentos,
        usuarioRegistro: data.usuarioRegistro ?? this.mockDatabase[index].usuarioRegistro,
        dataHoraSituacao: `${now.toLocaleDateString('pt-BR')}, ${now.toLocaleTimeString('pt-BR')}`,
      };

      this.dataSubject.next([...this.mockDatabase]);
      return this.mockDatabase[index];
    }).pipe(
      catchError((err) => {
        this.errorSubject.next(err.message || 'Erro ao alterar lote');
        return throwError(() => err);
      }),
      finalize(() => this.loadingSubject.next(false))
    );
  }

  /** Excluir lotes */
  excluir(ids: number[]): Observable<void> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.simulateApiCall(() => {
      this.mockDatabase = this.mockDatabase.filter((r) => !ids.includes(r.idLote));
      this.dataSubject.next([...this.mockDatabase]);
    }).pipe(
      catchError((err) => {
        this.errorSubject.next(err.message || 'Erro ao excluir lotes');
        return throwError(() => err);
      }),
      finalize(() => this.loadingSubject.next(false))
    );
  }

  /** Atualizar situação de lotes (confirmar/enviar) */
  atualizarSituacao(ids: number[], situacao: string, justificativa: string): Observable<void> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.simulateApiCall(() => {
      const now = new Date();
      const dataHora = `${now.toLocaleDateString('pt-BR')}, ${now.toLocaleTimeString('pt-BR')}`;

      for (const id of ids) {
        const index = this.mockDatabase.findIndex((r) => r.idLote === id);
        if (index !== -1) {
          this.mockDatabase[index] = {
            ...this.mockDatabase[index],
            situacaoLote: situacao,
            usuarioAprovacao: 'usuario_teste',
            dataHoraSituacao: dataHora,
            justificativa,
          };
        }
      }

      this.dataSubject.next([...this.mockDatabase]);
    }).pipe(
      catchError((err) => {
        this.errorSubject.next(err.message || 'Erro ao atualizar situação');
        return throwError(() => err);
      }),
      finalize(() => this.loadingSubject.next(false))
    );
  }

  /** Obter justificativa de um lote */
  getJustificativa(idLote: number): string {
    const record = this.mockDatabase.find((r) => r.idLote === idLote);
    return record?.justificativa || 'Sem justificativa registrada.';
  }

  /** Simula uma chamada de API com delay de 1s */
  private simulateApiCall<T>(operation: () => T): Observable<T> {
    try {
      const result = operation();
      return of(result).pipe(delay(1000));
    } catch (error) {
      return throwError(() => error).pipe(delay(1000));
    }
  }

  /** Aplica filtros nos dados mock */
  private applyFilters(filters: FilterValues): LoteRecord[] {
    let result = [...this.mockDatabase];

    const idFrom = filters['idLote_from'];
    const idTo = filters['idLote_to'];
    if (idFrom) result = result.filter((r) => r.idLote >= Number(idFrom));
    if (idTo) result = result.filter((r) => r.idLote <= Number(idTo));

    const situacao = filters['situacaoLote'] as string;
    if (situacao) result = result.filter((r) => r.situacaoLote === situacao);

    const valorFrom = filters['valorLote_from'];
    const valorTo = filters['valorLote_to'];
    if (valorFrom) result = result.filter((r) => r.valor >= Number(valorFrom));
    if (valorTo) result = result.filter((r) => r.valor <= Number(valorTo));

    const dataFrom = filters['dataEntrada_from'] as Date | null;
    const dataTo = filters['dataEntrada_to'] as Date | null;
    if (dataFrom) result = result.filter((r) => r.dataEntrada >= dataFrom);
    if (dataTo) result = result.filter((r) => r.dataEntrada <= dataTo);

    return result;
  }

  private getNextId(): number {
    return this.mockDatabase.length > 0
      ? Math.max(...this.mockDatabase.map((r) => r.idLote)) + 1
      : 1;
  }
}
