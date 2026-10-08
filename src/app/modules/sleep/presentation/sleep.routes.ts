import { Routes } from '@angular/router';
export const SLEEP_ROUTES: Routes = [
  {
    path: 'log',
    title: 'Log sleep | PulsePower',
    data: { entry: true },
    loadComponent: () => import('./views/sleep-page/sleep-page').then((module) => module.SleepPage),
  },
  {
    path: '',
    title: 'Sleep | PulsePower',
    loadComponent: () => import('./views/sleep-page/sleep-page').then((module) => module.SleepPage),
  },
];
