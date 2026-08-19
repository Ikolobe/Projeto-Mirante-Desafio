# Projeto Mirante — Módulo Contábil: Outros Créditos/Débitos

Modernização de sistema legado (Flex → Angular) — Desafio prático front-end.

## Tecnologias

- **Angular 22.1** (standalone components, signals, control flow @if/@for)
- **TypeScript 6.0** com tipagem explícita
- **Angular Material** (ícones)
- **Bootstrap 5.3** (grid responsivo, utilitários)
- **ngx-bootstrap** (datepicker com locale pt-BR)
- **RxJS** (BehaviorSubject, operators: tap, catchError, finalize, delay, debounceTime)
- **Vitest** (testes unitários)

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

## Estrutura do projeto

```
src/app/
├── components/              # Componentes reutilizáveis
│   ├── action-bar/          # Barra de ações dinâmica
│   ├── breadcrumb/          # Navegação estrutural
│   ├── data-table/          # Tabela com paginação, seleção e ordenação
│   ├── dynamic-filter/      # Filtros dinâmicos configuráveis
│   ├── loading/             # Spinner de carregamento
│   └── sidebar/             # Menu lateral
├── pages/
│   ├── contabil/            # Tela principal — Outros Créditos/Débitos
│   │   ├── modal-incluir/   # Modal incluir/alterar/visualizar lote
│   │   ├── modal-justificativa/ # Modal justificativa (confirmar/enviar)
│   │   ├── contabil.component.ts
│   │   └── contabil.service.ts  # Camada de serviço com estado reativo
│   └── home/                # Página inicial
├── app.component.ts         # Layout principal (sidebar + content)
├── app.config.ts            # Configuração global (locale, animations, router)
└── app.routes.ts            # Rotas com lazy loading
```

## Decisões técnicas

### Arquitetura

- **Standalone components** — sem NgModules, cada componente declara seus imports diretamente.
- **Componentização reutilizável** — filtros, tabela e action-bar são componentes genéricos que recebem configuração via inputs. Podem ser usados em qualquer tela apenas passando arrays de configuração.
- **Camada de serviço separada** — `ContabilService` gerencia estado e simula API com RxJS Observables (`of` + `delay`). O componente é apenas camada de apresentação.

### Estado e reatividade

- **Signals** para estado local dos componentes (Angular 22).
- **BehaviorSubject** no service para estado compartilhado (`data$`, `loading$`, `error$`).
- **takeUntilDestroyed** para limpeza automática de subscriptions.

### Formulários

- **Reactive Forms** com `FormBuilder` e `FormGroup` dinâmico construído a partir da configuração.
- **Validadores nativos** — range (De/Até obrigatórios em par, final >= inicial), data inválida.
- **Custom validators** — interface `CustomFilterValidator` permite que o componente pai injete validações extras.
- **Debounce** de 300ms na validação dos filtros.

### Formatação e locale

- `LOCALE_ID: pt-BR` registrado globalmente.
- Pipes `currency` e `date` formatam automaticamente em pt-BR.
- `CurrencyMaskDirective` customizada para inputs monetários.
- Datepicker ngx-bootstrap com locale pt-BR e tema personalizado.

### Acessibilidade

- `role="dialog"`, `aria-modal`, `aria-labelledby` nos modais.
- `role="grid"`, `aria-sort`, `aria-selected` na tabela.
- `role="toolbar"` na barra de ações.
- `role="search"`, `aria-expanded` no painel de filtros.
- `aria-label` em checkboxes, paginação e breadcrumbs.
- Navegação por teclado (Enter/Space nos headers, ESC fecha modais).

### Responsividade

- Grid Bootstrap (`row`/`col-md-*`) nos filtros.
- Tabela com `overflow-x: auto` para scroll horizontal em telas menores.
- Action-bar com `flex-wrap`.

### Design patterns

- **ChangeDetectionStrategy.OnPush** nos componentes reutilizáveis.
- **Single Responsibility** — cada componente/service tem uma responsabilidade clara.
- **Open/Closed** — filtros e tabela são extensíveis via configuração sem modificar o componente.
- **Dependency Injection** — service injetado via `inject()`.

## Paleta de cores

| Uso | Cor |
|-----|-----|
| Primária (header, botões) | `#00695c` |
| Hover/Destaque | `#00897b` |
| Fundo seleção | `#e0f2f1` |
| Texto principal | `#37474f` |
| Texto secundário | `#607d8b` |
| Bordas | `#e0e0e0` |
| Erro | `#d32f2f` |
