import { AssistantConversation } from '../../domain/model/assistant-conversation.entity';
import { PhysiologicalOverview } from '../../domain/model/physiological-overview';
export abstract class PhysiologicalRepository {
  async deviceScenario(
    _outcome: 'success' | 'denied' | 'error' | 'disconnected',
    _battery: number,
  ): Promise<PhysiologicalOverview> {
    throw new Error('Device simulation is available in the demo workspace.');
  }
  abstract load(): Promise<PhysiologicalOverview>;
  abstract synchronize(): Promise<PhysiologicalOverview>;
  abstract ask(
    conversation: AssistantConversation | null,
    message: string,
  ): Promise<AssistantConversation>;
}
