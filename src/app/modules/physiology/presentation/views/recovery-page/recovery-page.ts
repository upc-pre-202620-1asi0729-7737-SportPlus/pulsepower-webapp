import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { RecoverySimulationStore } from '../../../application/recovery-simulation.store';
import { LineChart } from '../../../../../shared/presentation/components/line-chart/line-chart';
import { Translate, LocalizedDate } from '../../../../../shared/application/i18n';
import { WorkspaceMode } from '../../../../../shared/application/workspace-mode';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PhysiologicalStore } from '../../../application/physiological.store';
import { PageHeading } from '../../../../../shared/presentation/components/page-heading/page-heading';
import { MetricCard } from '../../../../../shared/presentation/components/metric-card/metric-card';
import { EmptyState } from '../../../../../shared/presentation/components/empty-state/empty-state';
import { Feedback } from '../../../../../shared/presentation/components/feedback/feedback';
import { Icon } from '../../../../../shared/presentation/components/icon/icon';
@Component({
  selector: 'pp-recovery-page',
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    Translate,
    LineChart,
    LocalizedDate,
    FormsModule,
    PageHeading,
    MetricCard,
    EmptyState,
    Feedback,
    Icon,
  ],
  templateUrl: './recovery-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecoveryPage {
  readonly simulation = inject(RecoverySimulationStore);
  readonly workspace = inject(WorkspaceMode);
  readonly store = inject(PhysiologicalStore);
  question = '';
  battery = 80;
  outcome: 'success' | 'denied' | 'error' | 'disconnected' = 'success';
  constructor() {
    void this.store.load();
  }
  async ask(): Promise<void> {
    if (await this.store.ask(this.question)) this.question = '';
  }
}
