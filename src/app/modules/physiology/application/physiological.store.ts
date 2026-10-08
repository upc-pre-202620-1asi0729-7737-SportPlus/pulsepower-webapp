import { Injectable, computed, inject, signal } from '@angular/core';
import { ActionState } from '../../../shared/application/action-state';
import { requireText } from '../../../shared/domain/validation';
import { AssistantConversation } from '../domain/model/assistant-conversation.entity';
import { PhysiologicalOverview } from '../domain/model/physiological-overview';
import { PhysiologicalRepository } from './ports/physiological-repository';
@Injectable({ providedIn: 'root' })
export class PhysiologicalStore extends ActionState {
  private readonly repository = inject(PhysiologicalRepository);
  private readonly overview = signal<PhysiologicalOverview | null>(null);
  private readonly conversationState = signal<AssistantConversation | null>(null);
  readonly available = computed(() => this.overview()?.available ?? false);
  readonly connection = computed(() => this.overview()?.connection ?? null);
  readonly assessment = computed(() => this.overview()?.assessment ?? null);
  readonly recommendations = computed(() => this.overview()?.recommendations ?? []);
  readonly alerts = computed(() => this.overview()?.alerts ?? []);
  readonly hrv = computed(
    () =>
      this.overview()
        ?.records.filter((row) => row.metric === 'HRV')
        .sort((a, b) => b.recordedAt.localeCompare(a.recordedAt))[0] ?? null,
  );
  readonly restingHeartRate = computed(
    () =>
      this.overview()
        ?.records.filter((row) => row.metric === 'RESTING_HR')
        .sort((a, b) => b.recordedAt.localeCompare(a.recordedAt))[0] ?? null,
  );
  readonly conversation = this.conversationState.asReadonly();
  deviceScenario(
    outcome: 'success' | 'denied' | 'error' | 'disconnected',
    battery: number,
  ): Promise<boolean> {
    return this.execute(async () =>
      this.overview.set(await this.repository.deviceScenario(outcome, battery)),
    );
  }
  load(): Promise<boolean> {
    return this.read(async () => this.overview.set(await this.repository.load()));
  }
  synchronize(): Promise<boolean> {
    return this.execute(
      async () => this.overview.set(await this.repository.synchronize()),
      'Wearable synchronized.',
    );
  }
  ask(message: string): Promise<boolean> {
    return this.execute(async () => {
      const valid = requireText(message, 'Message', 2000);
      this.conversationState.set(await this.repository.ask(this.conversation(), valid));
    });
  }
}
