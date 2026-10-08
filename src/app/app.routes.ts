import { Routes } from '@angular/router';
import { requireFocus } from './shared/application/focus-guard';

export const routes: Routes = [
  {
    path: 'privacy',
    title: 'Privacy Policy | PulsePower',
    loadComponent: () =>
      import('./shared/presentation/views/privacy-page/privacy-page').then((m) => m.PrivacyPage),
  },
  {
    path: 'terms',
    title: 'Terms of Service | PulsePower',
    loadComponent: () =>
      import('./shared/presentation/views/terms-page/terms-page').then((m) => m.TermsPage),
  },
  { path: '', pathMatch: 'full', redirectTo: 'sign-in' },
  {
    path: '',
    loadChildren: () =>
      import('./modules/iam/presentation/iam.routes').then((module) => module.IAM_ROUTES),
  },
  {
    path: '',
    loadComponent: () =>
      import('./shared/presentation/components/layout/layout').then((m) => m.Layout),
    children: [
      {
        path: 'help',
        title: 'Help | PulsePower',
        loadComponent: () =>
          import('./shared/presentation/views/help-page/help-page').then(
            (module) => module.HelpPage,
          ),
      },
      {
        path: 'home',
        title: 'Home | PulsePower',
        loadComponent: () =>
          import('./shared/presentation/views/home-page/home-page').then(
            (module) => module.HomePage,
          ),
      },
      {
        path: 'training',
        canActivate: [requireFocus('Athlete')],
        loadChildren: () =>
          import('./modules/training/presentation/training.routes').then(
            (module) => module.TRAINING_ROUTES,
          ),
      },
      {
        path: 'planning',
        canActivate: [requireFocus('Athlete')],
        loadChildren: () =>
          import('./modules/training/presentation/training.routes').then(
            (module) => module.PLANNING_ROUTES,
          ),
      },
      {
        path: 'sleep',
        loadChildren: () =>
          import('./modules/sleep/presentation/sleep.routes').then((module) => module.SLEEP_ROUTES),
      },
      {
        path: 'wellness',
        loadChildren: () =>
          import('./modules/wellness/presentation/wellness.routes').then(
            (module) => module.WELLNESS_ROUTES,
          ),
      },
      {
        path: 'recovery',
        canActivate: [requireFocus('Athlete')],
        loadChildren: () =>
          import('./modules/physiology/presentation/physiological.routes').then(
            (module) => module.PHYSIOLOGICAL_ROUTES,
          ),
      },
      {
        path: 'reports',
        loadChildren: () =>
          import('./modules/reports/presentation/reporting.routes').then(
            (module) => module.REPORTING_ROUTES,
          ),
      },
      {
        path: 'community',
        loadChildren: () =>
          import('./modules/community/presentation/community.routes').then(
            (module) => module.COMMUNITY_ROUTES,
          ),
      },
      {
        path: 'settings',
        loadChildren: () =>
          import('./modules/iam/presentation/profile.routes').then(
            (module) => module.PROFILE_ROUTES,
          ),
      },
      {
        path: 'subscription',
        title: 'Subscription | PulsePower',
        loadComponent: () =>
          import('./modules/iam/presentation/views/subscription-page/subscription-page').then(
            (module) => module.SubscriptionPage,
          ),
      },
      {
        path: '**',
        title: 'Page not found | PulsePower',
        loadComponent: () =>
          import('./shared/presentation/views/not-found/not-found').then(
            (module) => module.NotFound,
          ),
      },
    ],
  },
];
