import { Routes } from '@angular/router';
export const PROFILE_ROUTES: Routes = [
  {
    path: '',
    title: 'Settings | PulsePower',
    loadComponent: () =>
      import('./views/settings-page/settings-page').then((module) => module.SettingsPage),
  },
];
