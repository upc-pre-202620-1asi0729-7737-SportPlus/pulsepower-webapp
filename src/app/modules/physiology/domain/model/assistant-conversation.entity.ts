import { AssistantMessage } from './assistant-message.entity';

export interface AssistantConversation {
  readonly id: string;
  readonly messages: readonly AssistantMessage[];
}
