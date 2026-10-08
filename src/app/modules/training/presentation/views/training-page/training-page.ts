import { MatButtonModule } from '@angular/material/button';
import { SessionList } from '../../components/session-list/session-list';
import { Translate } from '../../../../../shared/application/i18n';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SessionForm } from '../../components/session-form/session-form';
import { RouterLink } from '@angular/router';
import { TrainingStore, SessionCommand } from '../../../application/training.store';
import { PageHeading } from '../../../../../shared/presentation/components/page-heading/page-heading';
import { MetricCard } from '../../../../../shared/presentation/components/metric-card/metric-card';
import { LineChart } from '../../../../../shared/presentation/components/line-chart/line-chart';
import { RouteEntryDialog } from '../../../../../shared/presentation/components/route-entry-dialog/route-entry-dialog';
import { FormDialog } from '../../../../../shared/presentation/components/form-dialog/form-dialog';
import { Feedback } from '../../../../../shared/presentation/components/feedback/feedback';
import { Icon } from '../../../../../shared/presentation/components/icon/icon';

@Component({
  selector: 'pp-training-page',
  imports: [
    MatButtonModule,
    SessionList,
    Translate,
    SessionForm,
    RouterLink,
    PageHeading,
    MetricCard,
    LineChart,
    FormDialog,
    RouteEntryDialog,
    Feedback,
    Icon,
  ],
  templateUrl: './training-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrainingPage {
  readonly store = inject(TrainingStore);
  form: SessionCommand = this.blank();
  constructor() {
    void this.store.load();
  }
  open(dialog: FormDialog): void {
    this.form = this.blank();
    dialog.open();
  }
  async save(command: SessionCommand, dialog: FormDialog): Promise<void> {
    if (await this.store.addSession(command)) dialog.close();
  }
  private blank(): SessionCommand {
    return {
      date: this.store.today,
      activity: '',
      durationMinutes: 30,
      perceivedEffort: 5,
      notes: '',
      plannedActivityId: null,
    };
  }
}
