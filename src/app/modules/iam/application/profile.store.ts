import { Injectable, computed, inject, signal } from '@angular/core';
import { ActionState } from '../../../../../../../../../../../Downloads/pulsepower-webapp/src/app/shared/application/action-state';
import { Clock } from '../../../../../../../../../../../Downloads/pulsepower-webapp/src/app/shared/application/clock';
import { requireText } from '../../../../../../../../../../../Downloads/pulsepower-webapp/src/app/shared/domain/validation';
import { UserProfile, userProfile } from '../domain/model/user-profile.entity';
import { ProfileRepository } from './ports/profile-repository';
export type ProfileCommand = { -readonly [K in keyof Omit<UserProfile, 'goals'>]: UserProfile[K] };
@Injectable({ providedIn: 'root' })
export class ProfileStore extends ActionState {
  private readonly repository = inject(ProfileRepository);
  private readonly clock = inject(Clock);
  private readonly state = signal<UserProfile | null>(null);
  readonly profile = this.state.asReadonly();
  readonly name = computed(() => this.profile()?.displayName ?? 'Your workspace');
  readonly initials = computed(
    () =>
      this.profile()
        ?.displayName.split(/\s+/)
        .slice(0, 2)
        .map((word) => word[0])
        .join('')
        .toUpperCase() ?? 'PP',
  );
  load(): Promise<boolean> {
    return this.read(async () => this.state.set(await this.repository.load()));
  }
  save(command: ProfileCommand): Promise<boolean> {
    return this.execute(async () => {
      const profile = userProfile({ ...command, goals: this.profile()?.goals ?? [] });
      await this.repository.save(profile);
      this.state.set(profile);
    }, 'Profile updated.');
  }
  addGoal(description: string): Promise<boolean> {
    return this.execute(async () => {
      const profile = this.profile();
      if (!profile) throw new Error('Save your profile before adding a goal.');
      const next = {
        ...profile,
        goals: [
          ...profile.goals,
          {
            id: this.clock.id(),
            description: requireText(description, 'Goal', 200),
            completed: false,
          },
        ],
      };
      await this.repository.save(next);
      this.state.set(next);
    }, 'Goal added.');
  }
  toggleGoal(id: string): Promise<boolean> {
    return this.execute(async () => {
      const profile = this.profile();
      if (!profile) throw new Error('Save your profile first.');
      const next = {
        ...profile,
        goals: profile.goals.map((goal) =>
          goal.id === id ? { ...goal, completed: !goal.completed } : goal,
        ),
      };
      await this.repository.save(next);
      this.state.set(next);
    }, 'Goal updated.');
  }
}
