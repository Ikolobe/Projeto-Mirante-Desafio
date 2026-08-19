# Projeto Mirante — Módulo Contábil: Outros Créditos/Débitos

Modernização de sistema legado (Flex → Angular) — Desafio prático front-end.

## Tecnologias

- **Angular 22.1** (standalone components, signals, control flow @if/@for)
- **TypeScript 6.0** com tipagem explícita
- **Angular Material** (MatDialog, MatIcon)
- **Bootstrap 5.3** (grid responsivo, utilitários)
- **ngx-bootstrap** (bsDatepicker com locale pt-BR)
- **RxJS** (BehaviorSubject, operators: tap, catchError, finalize, delay, debounceTime)
- **Vitest** (testes unitários — 15 testes passando)
- **ESLint** (angular-eslint — lint 100% limpo)

## Pré-requisitos

- Node.js 20+
- npm 10+

## Instalação

```bash
npm install
```

## Execução

```bash
ng serve
```

Acesse `http://localhost:4200`

## Build de produção

```bash
ng build
```

## Testes

```bash
ng test
```

## Lint

```bash
ng lint
```

## Estrutura do projeto

```
src/app/
├── components/                    # Componentes reutilizáveis
│   ├── action-bar/                # Barra de ações dinâmica
│   ├── breadcrumb/                # Navegação estrutural
│   ├── data-table/                # Tabela com paginação, seleção e ordenação
│   ├── dynamic-filter/            # Filtros dinâmicos configuráveis
│   ├── loading/                   # Spinner de carregamento
│   └── sidebar/                   # Menu lateral
├── pages/
│   ├── contabil/                  # Tela principal — Outros Créditos/Débitos
│   │   ├── modal-incluir/         # Modal incluir/alterar/visualizar lote (MatDialog)
│   │   ├── modal-justificativa/   # Modal justificativa confirmar/enviar (MatDialog)
│   │   ├── contabil.component.ts  # Componente orquestrador da tela
│   │   └── contabil.service.ts    # Camada de serviço com estado reativo
│   └── home/                      # Página inicial
├── utils/
│   ├── utils.provider.ts          # UtilsProvider (toast, validators, formatação)
│   └── toast.component.ts         # Componente visual do toast
├── app.component.ts               # Layout principal (sidebar + content + toast)
├── app.config.ts                  # Configuração global (locale, animations, router)
└── app.routes.ts                  # Rotas com lazy loading
```

## Funcionalidades implementadas

### Tela de Consulta de Lotes
- Breadcrumb com navegação (Início > Outros Créditos/Débitos)
- Painel de filtros recolhível (expandir/recolher com animação)
- Filtros: Instituição Resp., Instituição, Situação Lote (select), ID Lote (range), Valor Lote (range monetário), Data Entrada (range com datepicker)
- Validações de range (De/Até obrigatórios em par, final >= inicial, data inválida)
- Suporte a custom validators via componente pai
- Debounce de 300ms na validação
- Botão Pesquisar desabilitado quando há erros
- Barra de ações: Confirmar, Enviar, Visualizar Justificativa, Incluir, Alterar, Excluir, Visualizar
- Botões com habilitação condicional (disabled quando sem seleção)
- Tabela com checkbox (individual + selecionar todos), ordenação asc/desc por coluna, paginação
- Loading spinner com overlay durante operações assíncronas
- Toast de sucesso após cada operação (incluir, alterar, excluir, confirmar, enviar)

### Modais (MatDialog)
- **Incluir Lote**: campos Data Entrada (datepicker), Valor (currency mask), Quant. Lançamentos, Usuário Registro
- **Alterar Lote**: mesma modal com dados pré-preenchidos + campos readonly (Usuário Aprovação, Situação)
- **Visualizar Lote**: mesma modal com todos os campos readonly (classe visual `.field-readonly`)
- **Justificativa**: textarea para confirmar/enviar + visualização readonly

### Ações
- **Confirmar/Enviar**: abre modal de justificativa, atualiza situação + usuário aprovação em múltiplos lotes
- **Excluir**: remove lotes selecionados da lista
- **Visualizar Justificativa**: exibe justificativa registrada

## Decisões técnicas

### Arquitetura
- **Standalone components** — sem NgModules, cada componente declara seus imports.
- **Componentização reutilizável** — filtros, tabela, action-bar e loading são genéricos, configuráveis via inputs.
- **Camada de serviço separada** — `ContabilService` gerencia estado e simula API com RxJS Observables (`of` + `delay`).
- **UtilsProvider** — service centralizado com toast, validators e funções de formatação.

### Estado e reatividade
- **Signals** para estado local dos componentes (Angular 22).
- **BehaviorSubject** no service para estado compartilhado (`data$`, `loading$`, `error$`).
- **takeUntilDestroyed** para limpeza automática de subscriptions.
- **effect()** na tabela para resetar seleção quando dados mudam.

### Formulários
- **Reactive Forms** com `FormBuilder` e `FormGroup` dinâmico.
- **Validadores nativos**: required, range (De/Até), data inválida.
- **Custom validators** via `CustomFilterValidator` — interface para o pai injetar validações.
- **dateValidator()** no UtilsProvider — aceita Date ou string dd/mm/yyyy.
- **Debounce** de 300ms na validação dos filtros.

### Modais
- **MatDialog** para gerenciamento de modais (padrão Angular Material).
- Dados passados via `MAT_DIALOG_DATA`, resultado via `afterClosed()`.
- Focus trap e ESC para fechar nativos do MatDialog.

### Formatação e locale
- `LOCALE_ID: pt-BR` registrado globalmente.
- Pipes `currency` e `date` formatam em pt-BR automaticamente.
- `CurrencyMaskDirective` customizada para inputs monetários.
- Datepicker ngx-bootstrap com locale pt-BR, tema personalizado e sem números de semana.

### Acessibilidade
- `role="dialog"`, `aria-modal`, `aria-labelledby` nos modais.
- `role="grid"`, `aria-sort`, `aria-selected` na tabela.
- `role="toolbar"` na barra de ações.
- `role="search"`, `aria-expanded` no painel de filtros.
- `aria-label` em checkboxes, paginação e breadcrumbs.
- Ordenação ativável por teclado (Enter/Space nos headers).
- Labels com `for`/`id` em todos os campos de formulário.
- Tabindex nos links de paginação.

### Responsividade
- Grid Bootstrap (`row`/`col-md-*`) nos filtros e modais.
- Tabela com `overflow-x: auto` para scroll horizontal.
- Action-bar com `flex-wrap`.
- `min-width: 0` no content area para evitar overflow.

### Qualidade de código
- **ChangeDetectionStrategy.OnPush** nos componentes reutilizáveis.
- **Single Responsibility** — componente cuida de UI, service cuida de dados.
- **Open/Closed** — filtros e tabela extensíveis via configuração.
- **ESLint** configurado e passando sem erros.
- **15 testes unitários** cobrindo o service (search, incluir, alterar, excluir, atualizarSituacao, getJustificativa, loading state).
- **Nomenclatura padronizada** (`.component.ts`, `.service.ts`, `.directive.ts`, `.model.ts`).

## Paleta de cores

| Uso | Cor |
|-----|-----|
| Primária (header tabela, botões filled, títulos modal) | `#00695c` |
| Hover/Destaque | `#00897b` |
| Fundo seleção | `#e0f2f1` |
| Selecionado forte | `#b2dfdb` |
| Texto principal | `#37474f` |
| Texto secundário | `#607d8b` |
| Bordas | `#e0e0e0` |
| Erro/Validação | `#d32f2f` |
| Background readonly | `#f5f5f5` |
