import { Injectable } from '@angular/core';
import { PhysiologicalRepository } from '../application/ports/physiological-repository';
import { AssistantConversation } from '../domain/model/assistant-conversation.entity';
import { PhysiologicalOverview } from '../domain/model/physiological-overview';
import { physiologicalOverview } from './physiological-assembler';
@Injectable()
export class UnconnectedPhysiologicalRepository extends PhysiologicalRepository {
  // TODO: replace this adapter with the confirmed AIoTI/backend contract. Do not calculate recovery in the browser.
  async load(): Promise<PhysiologicalOverview> {
    return physiologicalOverview({
      integration_available: false,
      connection: null,
      records: [],
      recovery: null,
      recommendations: [],
      alerts: [],
    });
  }
  async synchronize(): Promise<PhysiologicalOverview> {
    throw new Error('Wearable synchronization is not connected in this local workspace.');
  }
  async ask(
    _conversation: AssistantConversation | null,
    _message: string,
  ): Promise<AssistantConversation> {
    throw new Error('Recovery guidance is unavailable in this local workspace.');
  }
}
