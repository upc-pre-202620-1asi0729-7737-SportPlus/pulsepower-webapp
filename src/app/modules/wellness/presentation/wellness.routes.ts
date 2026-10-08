import { Routes } from '@angular/router';
export const WELLNESS_ROUTES: Routes = [
  {
    path: 'log',
    title: 'Log wellness | PulsePower',
    data: { entry: true },
    loadComponent: () =>
      import('./views/wellness-page/wellness-page').then((module) => module.WellnessPage),
  },
  {
    path: '',
    title: 'Wellness | PulsePower',
    loadComponent: () =>
      import('./views/wellness-page/wellness-page').then((module) => module.WellnessPage),
  },
];
