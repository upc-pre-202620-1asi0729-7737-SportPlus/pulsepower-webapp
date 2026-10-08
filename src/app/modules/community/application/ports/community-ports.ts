import { Achievement } from '../../domain/model/achievement.entity';
import { SharedProgress } from '../../domain/model/shared-progress.entity';
import { UserAchievement } from '../../domain/model/user-achievement';
export abstract class ActivityHistory {
  abstract dates(): Promise<readonly string[]>;
}
export abstract class CommunityRepository {
  abstract shares(): Promise<Readonly<Record<string, readonly ('group' | 'contact')[]>>>;
  abstract saveShares(
    value: Readonly<Record<string, readonly ('group' | 'contact')[]>>,
  ): Promise<void>;
  abstract list(): Promise<readonly SharedProgress[]>;
  abstract save(progress: SharedProgress): Promise<void>;
  abstract remove(id: string): Promise<void>;
  abstract achievements(): Promise<{
    catalog: readonly Achievement[];
    earned: readonly UserAchievement[];
  }>;
}
