import { Routes } from '@angular/router';
export const PHYSIOLOGICAL_ROUTES: Routes = [
  {
    path: '',
    title: 'Recovery & insights | PulsePower',
    loadComponent: () =>
      import('./views/recovery-page/recovery-page').then((module) => module.RecoveryPage),
  },
];
export const DEVICE_SIMULATOR_ROUTES: Routes = [
  {
    path: '',
    title: 'Simulated device | PulsePower',
    loadComponent: () =>
      import('./views/device-simulator-page/device-simulator-page').then(
        (module) => module.DeviceSimulatorPage,
      ),
  },
];
export const ASSISTANT_ROUTES: Routes = [
  {
    path: '',
    title: 'Recovery guide | PulsePower',
    loadComponent: () =>
      import('./views/assistant-page/assistant-page').then((module) => module.AssistantPage),
  },
];
