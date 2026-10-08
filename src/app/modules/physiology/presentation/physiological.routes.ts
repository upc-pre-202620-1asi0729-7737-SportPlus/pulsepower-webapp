import { Routes } from '@angular/router';
export const PHYSIOLOGICAL_ROUTES: Routes = [
  {
    path: '',
    title: 'Recovery & insights | PulsePower',
    loadComponent: () =>
      import('./views/recovery-page/recovery-page').then((module) => module.RecoveryPage),
  },
];
