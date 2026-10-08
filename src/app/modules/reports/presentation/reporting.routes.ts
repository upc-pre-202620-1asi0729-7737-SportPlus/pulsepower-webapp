import { Routes } from '@angular/router';
export const REPORTING_ROUTES: Routes = [
  {
    path: '',
    title: 'Reports | PulsePower',
    loadComponent: () =>
      import('./views/reports-page/reports-page').then((module) => module.ReportsPage),
  },
];
