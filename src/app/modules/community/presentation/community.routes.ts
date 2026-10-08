import { Routes } from '@angular/router';
export const COMMUNITY_ROUTES: Routes = [
  {
    path: '',
    title: 'Community | PulsePower',
    loadComponent: () =>
      import('./views/community-page/community-page').then((module) => module.CommunityPage),
  },
];
