import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/home/home').then((m) => m.Home),
    pathMatch: 'full',
  },
  {
    path: 'contabil',
    loadComponent: () =>
      import('./pages/contabil/contabil').then((m) => m.Contabil),
    data: { breadcrumb: 'Outros Créditos/Débitos' },
  },
];
