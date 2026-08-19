import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/home/home.component').then((m) => m.HomeComponent),
    pathMatch: 'full',
  },
  {
    path: 'contabil',
    loadComponent: () =>
      import('./pages/contabil/contabil.component').then((m) => m.ContabilComponent),
    data: { breadcrumb: 'Outros Créditos/Débitos' },
  },
];
