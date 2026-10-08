import { Injectable, OnDestroy, inject, signal, computed } from '@angular/core';
import { NotificationPreferencesStore } from './notification-preferences.store';
import { SleepStore } from '../../modules/sleep/application/sleep.store';
import { TrainingStore } from '../../modules/training/application/training.store';
import { NotificationInbox } from './ports/notification-inbox';
import { LocalNotification } from '../domain/model/local-notification';
import { isAllowedTime } from '../domain/model/notification-preferences';
import { localDate } from './calendar';
@Injectable({ providedIn: 'root' })
export class NotificationCenter implements OnDestroy {
  private readonly prefs = inject(NotificationPreferencesStore);
  private readonly sleep = inject(SleepStore);
  private readonly training = inject(TrainingStore);
  private readonly repository = inject(NotificationInbox);
  readonly rows = signal<readonly LocalNotification[]>([]);
  readonly error = signal<string | null>(null);
  readonly delivered = computed(() => this.rows().filter((r) => r.deliveredAt));
  private timer: ReturnType<typeof setInterval> | undefined;
  async start(): Promise<void> {
    if (this.timer) return;
    try {
      this.rows.set(this.repository.load());
      await Promise.all([this.prefs.load(), this.sleep.load(), this.training.load()]);
      this.tick();
      this.timer = setInterval(() => this.tick(), 15000);
    } catch {
      this.error.set('Notifications could not be loaded.');
    }
  }
  tick(now = new Date()): void {
    try {
      const date = localDate(now),
        time = now.toTimeString().slice(0, 5),
        prefs = this.prefs.preferences();
      const rows = [...this.rows()];
      const add = (id: string, kind: LocalNotification['kind'], title: string, at: string) => {
        const index = rows.findIndex((r) => r.id === id);
        if (index < 0)
          rows.push({ id, kind, title, dueAt: date + 'T' + at + ':00', deliveredAt: null });
        else if (!rows[index]!.deliveredAt)
          rows[index] = { ...rows[index]!, dueAt: date + 'T' + at + ':00' };
      };
      const routine = this.sleep.routine();
      if (routine?.reminderEnabled)
        add('sleep-' + date, 'sleep', 'Time to start your sleep routine.', routine.bedtime);
      if (prefs.digitalDisconnectEnabled)
        add(
          'disconnect-' + date,
          'disconnect',
          'Time for digital disconnection.',
          prefs.digitalDisconnectTime,
        );
      if (prefs.trainingEnabled)
        for (const activity of this.training
          .activities()
          .filter(
            (a) => a.date === date && a.status === 'Planned' && a.kind === 'Workout' && a.startTime,
          ))
          add(
            'training-' + activity.id,
            'training',
            'Your planned workout is due.',
            activity.startTime!,
          );
      const next = rows.map((row) => {
        const enabled =
          row.kind === 'training'
            ? prefs.trainingEnabled &&
              this.training
                .activities()
                .some((a) => 'training-' + a.id === row.id && a.status === 'Planned')
            : row.kind === 'sleep'
              ? !!routine?.reminderEnabled
              : prefs.digitalDisconnectEnabled;
        if (
          row.deliveredAt ||
          !enabled ||
          Date.parse(row.dueAt) > now.getTime() ||
          (row.kind === 'training' && !isAllowedTime(prefs, time))
        )
          return row;
        return { ...row, deliveredAt: now.toISOString() };
      });
      this.error.set(null);
      if (JSON.stringify(next) !== JSON.stringify(this.rows())) {
        this.repository.save(next);
        this.rows.set(next);
      }
    } catch {
      this.error.set('Notifications could not be saved.');
    }
  }
  ngOnDestroy(): void {
    clearInterval(this.timer);
  }
}
