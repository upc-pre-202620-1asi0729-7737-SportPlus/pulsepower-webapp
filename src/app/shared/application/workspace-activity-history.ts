import { Injectable, inject } from '@angular/core';
import { ActivityHistory } from '../../modules/community/application/ports/community-ports';
import { ReportSource } from '../../modules/reports/application/ports/report-ports';
@Injectable()
export class WorkspaceActivityHistory extends ActivityHistory {
  private readonly source = inject(ReportSource);
  async dates(): Promise<readonly string[]> {
    return (await this.source.entries()).map((row) => row.date);
  }
}
