import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { skip, take } from 'rxjs';
import { ContabilService } from './contabil.service';

describe('ContabilService', () => {
  let service: ContabilService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ContabilService);
  });

  it('deve ser criado', () => {
    expect(service).toBeTruthy();
  });

  describe('search', () => {
    it('deve retornar todos os dados quando filtros estão vazios', () => {
      return new Promise<void>((resolve) => {
        service.data$.pipe(skip(1), take(1)).subscribe((result) => {
          expect(result.length).toBe(13);
          resolve();
        });
        service.search({});
      });
    });

    it('deve filtrar por situacaoLote', () => {
      return new Promise<void>((resolve) => {
        service.data$.pipe(skip(1), take(1)).subscribe((result) => {
          expect(result.length).toBeGreaterThan(0);
          expect(result.every((r) => r.situacaoLote === 'Aberto')).toBe(true);
          resolve();
        });
        service.search({ situacaoLote: 'Aberto' });
      });
    });

    it('deve filtrar por ID Lote (faixa De/Até)', () => {
      return new Promise<void>((resolve) => {
        service.data$.pipe(skip(1), take(1)).subscribe((result) => {
          expect(result.every((r) => r.idLote >= 5 && r.idLote <= 8)).toBe(true);
          expect(result.length).toBe(4);
          resolve();
        });
        service.search({ idLote_from: 5, idLote_to: 8 });
      });
    });

    it('deve filtrar por valor (faixa De/Até)', () => {
      return new Promise<void>((resolve) => {
        service.data$.pipe(skip(1), take(1)).subscribe((result) => {
          expect(result.every((r) => r.valor >= 1000 && r.valor <= 3000)).toBe(true);
          resolve();
        });
        service.search({ valorLote_from: 1000, valorLote_to: 3000 });
      });
    });

    it('deve filtrar por data de entrada', () => {
      return new Promise<void>((resolve) => {
        const dataFrom = new Date(2026, 5, 1);
        const dataTo = new Date(2026, 6, 15);
        service.data$.pipe(skip(1), take(1)).subscribe((result) => {
          expect(result.every((r) => r.dataEntrada >= dataFrom && r.dataEntrada <= dataTo)).toBe(true);
          resolve();
        });
        service.search({ dataEntrada_from: dataFrom, dataEntrada_to: dataTo });
      });
    });

    it('deve ativar e desativar loading', () => {
      return new Promise<void>((resolve) => {
        const states: boolean[] = [];
        service.loading$.pipe(take(3)).subscribe((l) => {
          states.push(l);
          if (states.length === 3) {
            expect(states[0]).toBe(false); // inicial
            expect(states[1]).toBe(true);  // loading ativo
            expect(states[2]).toBe(false); // loading desativado
            resolve();
          }
        });
        service.search({});
      });
    });
  });

  describe('incluir', () => {
    it('deve adicionar um novo lote com situação Aberto', () => {
      return new Promise<void>((resolve) => {
        service.incluir({
          dataEntrada: new Date(2026, 8, 1),
          valor: 5000,
          quantLancamentos: 3,
          usuarioRegistro: 'teste_user',
        }).subscribe((result) => {
          expect(result.situacaoLote).toBe('Aberto');
          expect(result.valor).toBe(5000);
          expect(result.usuarioRegistro).toBe('teste_user');
          expect(result.idLote).toBe(15);
          resolve();
        });
      });
    });

    it('deve atualizar o data$ após inclusão', () => {
      return new Promise<void>((resolve) => {
        service.incluir({
          dataEntrada: new Date(2026, 8, 1),
          valor: 999,
          quantLancamentos: 1,
          usuarioRegistro: 'novo_user',
        }).subscribe(() => {
          service.data$.pipe(take(1)).subscribe((data) => {
            expect(data.find((r) => r.valor === 999)).toBeDefined();
            resolve();
          });
        });
      });
    });
  });

  describe('alterar', () => {
    it('deve alterar dados de um lote existente', () => {
      return new Promise<void>((resolve) => {
        service.alterar(2, { valor: 9999, usuarioRegistro: 'alterado_user' })
          .subscribe((result) => {
            expect(result.valor).toBe(9999);
            expect(result.usuarioRegistro).toBe('alterado_user');
            resolve();
          });
      });
    });

    it('deve emitir erro ao alterar lote inexistente', () => {
      return new Promise<void>((resolve) => {
        service.alterar(9999, { valor: 100 }).subscribe({
          error: () => {
            service.error$.pipe(take(1)).subscribe((error) => {
              expect(error).toBe('Lote não encontrado');
              resolve();
            });
          },
        });
      });
    });
  });

  describe('excluir', () => {
    it('deve remover lotes por IDs', () => {
      return new Promise<void>((resolve) => {
        // Primeiro popula data$
        service.data$.pipe(skip(1), take(1)).subscribe((initialData) => {
          const initialLength = initialData.length;

          service.excluir([2, 3]).subscribe(() => {
            service.data$.pipe(take(1)).subscribe((data) => {
              expect(data.length).toBe(initialLength - 2);
              expect(data.find((r) => r.idLote === 2)).toBeUndefined();
              expect(data.find((r) => r.idLote === 3)).toBeUndefined();
              resolve();
            });
          });
        });
        service.search({});
      });
    });
  });

  describe('atualizarSituacao', () => {
    it('deve atualizar situação e justificativa de múltiplos lotes', () => {
      return new Promise<void>((resolve) => {
        service.data$.pipe(skip(1), take(1)).subscribe(() => {
          service.atualizarSituacao([2, 4], 'Confirmado', 'Justificativa teste').subscribe(() => {
            service.data$.pipe(take(1)).subscribe((data) => {
              const lote2 = data.find((r) => r.idLote === 2)!;
              const lote4 = data.find((r) => r.idLote === 4)!;

              expect(lote2.situacaoLote).toBe('Confirmado');
              expect(lote2.justificativa).toBe('Justificativa teste');
              expect(lote2.usuarioAprovacao).toBe('usuario_teste');
              expect(lote4.situacaoLote).toBe('Confirmado');
              resolve();
            });
          });
        });
        service.search({});
      });
    });
  });

  describe('getJustificativa', () => {
    it('deve retornar mensagem padrão se não houver justificativa', () => {
      expect(service.getJustificativa(2)).toBe('Sem justificativa registrada.');
    });

    it('deve retornar justificativa após atualizar situação', () => {
      return new Promise<void>((resolve) => {
        service.atualizarSituacao([2], 'Confirmado', 'Minha justificativa').subscribe(() => {
          expect(service.getJustificativa(2)).toBe('Minha justificativa');
          resolve();
        });
      });
    });
  });
});
