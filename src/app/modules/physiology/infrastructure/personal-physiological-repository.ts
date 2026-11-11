import { Api } from '../../../shared/infrastructure/api';
import { AssistantConversation } from '../domain/model/assistant-conversation.entity';
import { Injectable, inject } from '@angular/core';
import { HttpPhysiologicalRepository } from './http-physiological-repository';
import { LocalRecoveryRepository } from './local-recovery-repository';
import { PhysiologicalOverviewDto } from './physiological-overview.dto';
/**
 * Personal accounts: wearable measurements (HRV, resting heart rate) come from the API,
 * while recovery, alerts and the recovery guide use the account's own records, so the
 * simulated device and manual records are reflected everywhere.
 */
@Injectable()
export class PersonalPhysiologicalRepository extends LocalRecoveryRepository {
  private readonly assistantApi = inject(Api);
  override async ask(conversation: AssistantConversation | null, message: string): Promise<AssistantConversation> {
    const response = await this.assistantApi.post<{answer:string}>('/assistant/messages', {message});
    const createdAt = this.clock.now().toISOString();
    return {id: conversation?.id ?? this.clock.id(), messages: [
      ...(conversation?.messages ?? []),
      {id:this.clock.id(), role:'user', content:message, createdAt},
      {id:this.clock.id(), role:'assistant', content:response.answer, createdAt},
    ]};
  }
  private readonly api = inject(HttpPhysiologicalRepository);
  private cached: Promise<PhysiologicalOverviewDto['records']> | null = null;
  protected readonly provider = 'AIoTI — simulated';
  protected readonly basis = 'Calculated from your sleep, stress and perceived effort records.';
  protected override suggestion(score: number | null): string {
    return score === null
      ? 'No recovery data for today.'
      : score < 40
        ? 'simulator.guidance.rest'
        : score < 70
          ? 'simulator.guidance.reduce'
          : 'simulator.guidance.follow';
  }
  protected measurements(): Promise<PhysiologicalOverviewDto['records']> {
    this.cached = this.api.fetchOverview().then(
      (dto) =>
        (['HRV', 'RESTING_HR'] as const).flatMap((metric) =>
          dto.records
            .filter((row) => row.metric === metric)
            .sort((a, b) => b.recorded_at.localeCompare(a.recorded_at))
            .slice(0, 1),
        ),
      (error) => {this.cached=null;throw error;},
    );
    return this.cached;
  }
}
