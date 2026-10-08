import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { SleepInsightsComponent } from '../../components/sleep-insights/sleep-insights';
import { SleepRecordList } from '../../components/sleep-record-list/sleep-record-list';
import { Translate } from '../../../../../shared/application/i18n';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SleepStore, SleepCommand, RoutineCommand } from '../../../application/sleep.store';
import { PageHeading } from '../../../../../shared/presentation/components/page-heading/page-heading';
import { MetricCard } from '../../../../../shared/presentation/components/metric-card/metric-card';
import { TrendChart } from '../../../../../shared/presentation/components/trend-chart/trend-chart';
import { RouteEntryDialog } from '../../../../../shared/presentation/components/route-entry-dialog/route-entry-dialog';
import { FormDialog } from '../../../../../shared/presentation/components/form-dialog/form-dialog';
import { Feedback } from '../../../../../shared/presentation/components/feedback/feedback';
import { Icon } from '../../../../../shared/presentation/components/icon/icon';
@Component({
  selector: 'pp-sleep-page',
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    SleepInsightsComponent,
    SleepRecordList,
    Translate,
    FormsModule,
    PageHeading,
    MetricCard,
    TrendChart,
    FormDialog,
    RouteEntryDialog,
    Feedback,
    Icon,
  ],
  templateUrl: './sleep-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SleepPage {
  readonly store = inject(SleepStore);
  form: SleepCommand = { startedAt: '', endedAt: '', notes: '' };
  routine: RoutineCommand = {
    bedtime: '22:00',
    wakeTime: '06:00',
    targetHours: 8,
    reminderEnabled: false,
  };
  constructor() {
    void this.store.load();
  }
  open(dialog: FormDialog): void {
    this.form = { startedAt: '', endedAt: '', notes: '' };
    dialog.open();
  }
  openRoutine(dialog: FormDialog): void {
    this.routine = { ...(this.store.routine() ?? this.routine) };
    dialog.open();
  }
  async save(dialog: FormDialog): Promise<void> {
    if (await this.store.addRecord(this.form)) dialog.close();
  }
  async saveRoutine(dialog: FormDialog): Promise<void> {
    if (await this.store.saveRoutine(this.routine)) dialog.close();
  }
}
