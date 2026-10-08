import { Routes } from '@angular/router';

export const IAM_ROUTES: Routes = [
  {
    path: 'sign-up',
    title: 'Create account | PulsePower',
    loadComponent: () => import('./views/sign-up-page/sign-up-page').then((m) => m.SignUpPage),
  },
  {
    path: 'sign-in',
    title: 'Sign in | PulsePower',
    loadComponent: () => import('./views/sign-in-page/sign-in-page').then((m) => m.SignInPage),
  },
];
