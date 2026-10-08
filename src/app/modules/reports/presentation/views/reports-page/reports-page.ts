import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { ReportTrends } from '../../../../../shared/application/report-trends';
import { LineChart } from '../../../../../shared/presentation/components/line-chart/line-chart';
import { Translate, LocalizedDate } from '../../../../../shared/application/i18n';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ReportingStore, ReportType } from '../../../application/reporting.store';
import { PageHeading } from '../../../../../shared/presentation/components/page-heading/page-heading';
import { EmptyState } from '../../../../../shared/presentation/components/empty-state/empty-state';
import { Feedback } from '../../../../../shared/presentation/components/feedback/feedback';
import { Icon } from '../../../../../shared/presentation/components/icon/icon';
@Component({
  selector: 'pp-reports-page',
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    LineChart,
    Translate,
    FormsModule,
    LocalizedDate,
    PageHeading,
    EmptyState,
    Feedback,
    Icon,
  ],
  templateUrl: './reports-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportsPage {
  readonly trends = inject(ReportTrends);
  readonly store = inject(ReportingStore);
  from = this.store.weekStart;
  to = this.store.today;
  note = '';
  selected: Record<ReportType, boolean> = {
    Training: true,
    Sleep: true,
    Wellness: true,
    Recovery: false,
  };
  constructor() {
    void this.store.load();
    void this.trends.load();
  }
  generate(): void {
    void this.store.generate({
      from: this.from,
      to: this.to,
      note: this.note,
      types: this.store.categories.filter((type) => this.selected[type]),
    });
  }
}
