import { Injectable, OnDestroy, computed, inject, signal } from '@angular/core';
import { ActionState } from '../../../shared/application/action-state';
import { Clock } from '../../../shared/application/clock';
import { BreathingRepository } from './ports/breathing-repository';
import { BreathingSession, finishBreathing } from '../domain/model/breathing-session';
@Injectable()
export class BreathingStore extends ActionState implements OnDestroy {
  private readonly repository = inject(BreathingRepository);
  private readonly clock = inject(Clock);
  readonly sessions = signal<readonly BreathingSession[]>([]);
  readonly remaining = signal(60);
  readonly isRunning = signal(false);
  readonly phase = computed(() =>
    (60 - this.remaining()) % 8 < 4 ? 'Breathe in gently' : 'Breathe out gently',
  );
  private started = 0;
  private id = '';
  private timer: ReturnType<typeof setInterval> | undefined;
  load(): Promise<boolean> {
    return this.read(async () => this.sessions.set(await this.repository.list()));
  }
  start(): void {
    if (this.isRunning() || this.busy()) return;
    this.id = this.clock.id();
    this.started = Date.now();
    this.remaining.set(60);
    this.isRunning.set(true);
    this.timer = setInterval(() => {
      this.remaining.set(Math.max(0, 60 - Math.floor((Date.now() - this.started) / 1000)));
      if (this.remaining() === 0) void this.finish(false);
    }, 250);
  }
  finish(interrupted = true): Promise<boolean> {
    if (!this.isRunning()) return Promise.resolve(false);
    clearInterval(this.timer);
    this.isRunning.set(false);
    return this.execute(async () => {
      await this.repository.save(finishBreathing(this.id, this.started, Date.now(), interrupted));
      this.sessions.set(await this.repository.list());
    });
  }
  ngOnDestroy(): void {
    clearInterval(this.timer);
    if (this.isRunning()) void this.finish(true);
  }
}
