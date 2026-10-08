import { Routes } from '@angular/router';
export const TRAINING_ROUTES: Routes = [
  {
    path: 'log',
    title: 'Log training | PulsePower',
    data: { entry: true },
    loadComponent: () =>
      import('./views/training-page/training-page').then((module) => module.TrainingPage),
  },
  {
    path: '',
    title: 'Training | PulsePower',
    loadComponent: () =>
      import('./views/training-page/training-page').then((module) => module.TrainingPage),
  },
];
export const PLANNING_ROUTES: Routes = [
  {
    path: '',
    title: 'Planning | PulsePower',
    loadComponent: () =>
      import('./views/planning-page/planning-page').then((module) => module.PlanningPage),
  },
];
