import { Injectable, inject, signal } from '@angular/core';
import { ActionState } from './action-state';
import { NotificationPreferencesRepository } from './ports/notification-preferences-repository';
import {
  NotificationPreferences,
  notificationPreferences,
  defaultNotificationPreferences,
  isAllowedTime,
} from '../domain/model/notification-preferences';
export type NotificationPreferencesCommand = {
  -readonly [K in keyof NotificationPreferences]: NotificationPreferences[K];
};
@Injectable({ providedIn: 'root' })
export class NotificationPreferencesStore extends ActionState {
  private readonly repository = inject(NotificationPreferencesRepository);
  readonly preferences = signal(defaultNotificationPreferences());
  readonly simulation = signal<string | null>(null);
  load(): Promise<boolean> {
    return this.read(async () => this.preferences.set(await this.repository.load()));
  }
  save(value: NotificationPreferencesCommand): Promise<boolean> {
    return this.execute(async () => {
      const valid = notificationPreferences(value);
      await this.repository.save(valid);
      this.preferences.set(valid);
      this.simulation.set(null);
    }, 'Notification preferences saved.');
  }
  simulate(time: string): void {
    const value = this.preferences();
    this.simulation.set(
      !value.trainingEnabled
        ? 'Simulation: training notifications are disabled.'
        : isAllowedTime(value, time)
          ? 'Simulation: the notification would be delivered now.'
          : 'Simulation: the notification would be postponed until the next allowed window.',
    );
  }
}
