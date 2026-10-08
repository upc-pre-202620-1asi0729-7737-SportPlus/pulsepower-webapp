import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { SleepHistoryRow } from '../../../application/sleep.store';
import { Translate, LocalizedDate } from '../../../../../shared/application/i18n';
import { EmptyState } from '../../../../../shared/presentation/components/empty-state/empty-state';
@Component({
  selector: 'pp-sleep-record-list',
  imports: [Translate, LocalizedDate, EmptyState],
  templateUrl: './sleep-record-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SleepRecordList {
  readonly records = input.required<readonly SleepHistoryRow[]>();
}
