import '@angular/compiler';
import { createEnvironmentInjector, runInInjectionContext, signal } from '@angular/core';
import { afterEach, expect, it, vi } from 'vitest';
import { NotificationCenter } from './notification-center';
import { NotificationPreferencesStore } from './notification-preferences.store';
import { NotificationInbox } from './ports/notification-inbox';
import { LocalNotification } from '../domain/model/local-notification';
import { defaultNotificationPreferences } from '../domain/model/notification-preferences';
import { SleepStore } from '../../modules/sleep/application/sleep.store';
import { TrainingStore } from '../../modules/training/application/training.store';
afterEach(() => vi.useRealTimers());
it('defers training, suppresses disabled sleep reminders and persists without duplicates', async () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-10-07T09:00:00'));
  const preferences = signal({ ...defaultNotificationPreferences(), trainingEnabled: true });
  const routine = signal({ bedtime: '22:00', reminderEnabled: false });
  let saved: readonly LocalNotification[] = [];
  const injector = createEnvironmentInjector(
    [
      { provide: NotificationPreferencesStore, useValue: { preferences, load: async () => true } },
      { provide: SleepStore, useValue: { routine, load: async () => true } },
      {
        provide: TrainingStore,
        useValue: {
          activities: () => [
            { id: '1', date: '2026-10-07', startTime: '21:00', status: 'Planned', kind: 'Workout' },
          ],
          load: async () => true,
        },
      },
      {
        provide: NotificationInbox,
        useValue: {
          load: () => saved,
          save: (rows: readonly LocalNotification[]) => {
            saved = rows;
          },
        },
      },
    ],
    null as never,
  );
  const center = runInInjectionContext(injector, () => new NotificationCenter());
  try {
    await center.start();
    center.tick(new Date('2026-10-07T22:00:00'));
    expect(center.delivered()).toHaveLength(0);
    expect(center.rows().some((r) => r.kind === 'sleep')).toBe(false);
    center.tick(new Date('2026-10-08T08:00:00'));
    expect(center.delivered()).toHaveLength(1);
    center.tick(new Date('2026-10-08T08:01:00'));
    expect(saved).toHaveLength(1);
  } finally {
    center.ngOnDestroy();
    injector.destroy();
  }
});
