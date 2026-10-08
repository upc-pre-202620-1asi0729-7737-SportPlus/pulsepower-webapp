import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { BreathingStore } from '../../../application/breathing.store';
import { CheckInList } from '../../components/check-in-list/check-in-list';
import { StressSleepSummaryComponent } from '../../../../../shared/presentation/components/stress-sleep-summary/stress-sleep-summary';
import { EmptyState } from '../../../../../shared/presentation/components/empty-state/empty-state';
import { Translate } from '../../../../../shared/application/i18n';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { WellnessStore, CheckInCommand } from '../../../application/wellness.store';
import { CheckInForm } from '../../components/check-in-form/check-in-form';
import { PageHeading } from '../../../../../shared/presentation/components/page-heading/page-heading';
import { MetricCard } from '../../../../../shared/presentation/components/metric-card/metric-card';
import { LineChart } from '../../../../../shared/presentation/components/line-chart/line-chart';
import { RouteEntryDialog } from '../../../../../shared/presentation/components/route-entry-dialog/route-entry-dialog';
import { FormDialog } from '../../../../../shared/presentation/components/form-dialog/form-dialog';
import { Feedback } from '../../../../../shared/presentation/components/feedback/feedback';
import { Icon } from '../../../../../shared/presentation/components/icon/icon';
@Component({
  selector: 'pp-wellness-page',
  providers: [BreathingStore],
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    StressSleepSummaryComponent,
    CheckInList,
    EmptyState,
    Translate,
    FormsModule,
    CheckInForm,
    PageHeading,
    MetricCard,
    LineChart,
    FormDialog,
    RouteEntryDialog,
    Feedback,
    Icon,
  ],
  templateUrl: './wellness-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WellnessPage {
  readonly breathing = inject(BreathingStore);
  readonly store = inject(WellnessStore);
  habitName = '';
  habitTarget = 7;
  constructor() {
    void this.store.load();
    void this.breathing.load();
  }
  async saveCheckIn(command: CheckInCommand, dialog: FormDialog): Promise<void> {
    if (await this.store.saveCheckIn(command)) dialog.close();
  }
  async saveHabit(dialog: FormDialog): Promise<void> {
    if (await this.store.addHabit(this.habitName, this.habitTarget)) {
      this.habitName = '';
      dialog.close();
    }
  }
}
