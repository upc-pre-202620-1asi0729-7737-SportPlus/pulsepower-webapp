import { ids } from '../../../shared/infrastructure/api';
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, timeout, map } from 'rxjs';
import { PhysiologicalRepository } from '../application/ports/physiological-repository';
import { AssistantConversation } from '../domain/model/assistant-conversation.entity';
import { PhysiologicalOverview } from '../domain/model/physiological-overview';
import { physiologicalOverview } from './physiological-assembler';
import { PhysiologicalOverviewDto } from './physiological-overview.dto';
import { environment } from '../../../../environments/environment';
@Injectable()
export class HttpPhysiologicalRepository extends PhysiologicalRepository {
  private readonly http = inject(HttpClient);
  private readonly endpoint = environment.apiUrl + '/physiology/overview';
  /** Raw overview from the API; times out so a sleeping server does not block the page. */
  fetchOverview(): Promise<PhysiologicalOverviewDto> {
    return firstValueFrom(
      this.http.get<any>(this.endpoint).pipe(timeout(8000),map(raw=>{const r=ids(raw);return ({integration_available:r.available,connection:r.connection?{...r.connection,id:String(r.connection.id),last_synced_at:r.connection.lastSyncedAt}:null,records:r.records.map((x:any)=>({...x,id:String(x.id),recorded_at:x.recordedAt})),recovery:r.assessment?{...r.assessment,id:'assessment',calculated_at:r.assessment.calculatedAt}:null,recommendations:r.recommendations.map((x:any)=>({...x,suggested_action:x.suggestedAction})),alerts:r.alerts.map((x:any)=>({...x,id:String(x.id),issued_at:x.issuedAt,reviewed_at:x.reviewedAt}))});})),
    );
  }
  async load(): Promise<PhysiologicalOverview> {
    try {
      const dto = await this.fetchOverview();
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
