import { ActivityHistory } from '../application/ports/community-ports';
import { currentStreak } from '../domain/model/streak';
import { Clock } from '../../../../../../../../../../../Downloads/pulsepower-webapp/src/app/shared/application/clock';
import { Injectable, inject } from '@angular/core';
import { BrowserStorage, asArray } from '../../../../../../../../../../../Downloads/pulsepower-webapp/src/app/shared/infrastructure/browser-storage';
import { CommunityRepository } from '../application/ports/community-ports';
import { Achievement } from '../domain/model/achievement.entity';
import { SharedProgress } from '../domain/model/shared-progress.entity';
import { UserAchievement } from '../domain/model/user-achievement';
import { CommunityAssembler } from './community-assembler';
@Injectable()
export class LocalCommunityRepository extends CommunityRepository {
  private readonly history = inject(ActivityHistory);
  private readonly clock = inject(Clock);
  async shares(): Promise<Readonly<Record<string, readonly ('group' | 'contact')[]>>> {
    return this.storage.read(
      'community-shares',
      (v) => v as Record<string, ('group' | 'contact')[]>,
      () => ({}),
    );
  }
  async saveShares(
    value: Readonly<Record<string, readonly ('group' | 'contact')[]>>,
  ): Promise<void> {
    this.storage.write('community-shares', value);
  }
  private readonly storage = inject(BrowserStorage);
  private records(): SharedProgress[] {
    return this.storage.read(
      'community',
      (value) => asArray(value).map(CommunityAssembler.toDomain),
      () => [],
    );
  }
  async list(): Promise<readonly SharedProgress[]> {
    return this.records();
  }
  async save(progress: SharedProgress): Promise<void> {
    this.storage.write('community', [progress, ...this.records()].map(CommunityAssembler.toDto));
  }
  async remove(id: string): Promise<void> {
    this.storage.write(
      'community',
      this.records()
        .filter((row) => row.id !== id)
        .map(CommunityAssembler.toDto),
    );
  }
  async achievements(): Promise<{
    catalog: readonly Achievement[];
    earned: readonly UserAchievement[];
  }> {
    const catalog: Achievement[] = [
      {
        id: 'demo-first-week',
        name: 'Seven consecutive days',
        description: 'Simulated achievement for seven consecutive days with records.',
      },
    ];
    const earned = this.storage.read<UserAchievement[]>(
      'earned-achievements',
      (v) => v as UserAchievement[],
      () => [],
    );
    if (
      currentStreak(await this.history.dates(), this.clock.today()).days >= 7 &&
      !earned.some((r) => r.achievementId === 'demo-first-week')
    ) {
      earned.push({ achievementId: 'demo-first-week', earnedAt: this.clock.now().toISOString() });
      this.storage.write('earned-achievements', earned);
    }
    return { catalog, earned };
  }
}
