import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { PhysiologicalRepository } from '../application/ports/physiological-repository';
import { AssistantConversation } from '../domain/model/assistant-conversation.entity';
import { PhysiologicalOverview } from '../domain/model/physiological-overview';
import { physiologicalOverview } from './physiological-assembler';
import { PhysiologicalOverviewDto } from './physiological-overview.dto';
import { environment } from '../../../../environments/environment';
@Injectable()
export class HttpPhysiologicalRepository extends PhysiologicalRepository {
  private readonly http = inject(HttpClient);
  private readonly endpoint = environment.apiUrl + '/physiological-overview';
  async load(): Promise<PhysiologicalOverview> {
    try {
      const dto = await firstValueFrom(this.http.get<PhysiologicalOverviewDto>(this.endpoint));
      return physiologicalOverview(dto);
    } catch {
      throw new Error('Wearable data could not be loaded. Try again in a minute.');
    }
  }
  async synchronize(): Promise<PhysiologicalOverview> {
    return this.load();
  }
  async ask(
    _conversation: AssistantConversation | null,
    _message: string,
  ): Promise<AssistantConversation> {
    throw new Error('Recovery guidance is unavailable in this workspace.');
  }
}
