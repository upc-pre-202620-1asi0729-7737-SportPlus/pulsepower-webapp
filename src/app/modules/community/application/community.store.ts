import { Injectable, inject, signal, computed } from '@angular/core';
import { WorkspaceMode } from '../../../shared/application/workspace-mode';
import { ActionState } from '../../../shared/application/action-state';
import { Clock } from '../../../shared/application/clock';
import { Achievement } from '../domain/model/achievement.entity';
import { SharedProgress, sharedProgress } from '../domain/model/shared-progress.entity';
import { Streak, currentStreak } from '../domain/model/streak';
import { ActivityHistory, CommunityRepository } from './ports/community-ports';
@Injectable({ providedIn: 'root' })
export class CommunityStore extends ActionState {
  readonly demo = inject(WorkspaceMode).mode === 'demo';
  readonly audience = signal<'group' | 'contact'>('group');
  private readonly demoShares = signal<Readonly<Record<string, readonly ('group' | 'contact')[]>>>(
    {},
  );
  readonly recipientPreview = computed(() =>
    this.progress().filter((progress) => this.demoShares()[progress.id]?.includes(this.audience())),
  );
  shareDemo(id: string): Promise<boolean> {
    return this.execute(async () => {
      if (!this.demo || !this.progress().some((p) => p.id === id)) return;
      const next = {
        ...this.demoShares(),
        [id]: [...new Set([...(this.demoShares()[id] ?? []), this.audience()])],
      };
      await this.repository.saveShares(next);
      this.demoShares.set(next);
    });
  }
  revokeDemo(id: string): Promise<boolean> {
    return this.execute(async () => {
      const next = {
        ...this.demoShares(),
        [id]: (this.demoShares()[id] ?? []).filter((a) => a !== this.audience()),
      };
      await this.repository.saveShares(next);
      this.demoShares.set(next);
    });
  }
  private readonly repository = inject(CommunityRepository);
  private readonly history = inject(ActivityHistory);
  private readonly clock = inject(Clock);
  private readonly progressState = signal<readonly SharedProgress[]>([]);
  private readonly streakState = signal<Streak>({ days: 0, lastRecordedDate: null });
  private readonly achievementsState = signal<readonly Achievement[]>([]);
  readonly progress = this.progressState.asReadonly();
  readonly streak = this.streakState.asReadonly();
  readonly achievements = this.achievementsState.asReadonly();
  load(): Promise<boolean> {
    return this.read(async () => {
      const [progress, dates, achievements] = await Promise.all([
        this.repository.list(),
        this.history.dates(),
        this.repository.achievements(),
      ]);
      this.progressState.set(progress);
      this.demoShares.set(await this.repository.shares());
      this.streakState.set(currentStreak(dates, this.clock.today()));
      this.achievementsState.set(
        achievements.catalog.filter((item) =>
          achievements.earned.some((earned) => earned.achievementId === item.id),
        ),
      );
    });
  }
  save(title: string, content: string): Promise<boolean> {
    return this.execute(async () => {
      const progress = sharedProgress({
        id: this.clock.id(),
        title,
        content,
        visibility: 'Private',
        createdAt: this.clock.now().toISOString(),
      });
      await this.repository.save(progress);
      this.progressState.set(await this.repository.list());
    }, 'Progress saved privately on this device.');
  }
  remove(id: string): Promise<boolean> {
    return this.execute(async () => {
      await this.repository.remove(id);
      this.progressState.set(await this.repository.list());
    }, 'Private progress removed.');
  }
}
