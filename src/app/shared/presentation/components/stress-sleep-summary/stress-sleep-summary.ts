import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { StressSleepSummary } from '../../../application/stress-sleep-summary';
import { Translate, LocalizedDate } from '../../../application/i18n';
@Component({
  selector: 'pp-stress-sleep-summary',
  imports: [Translate, LocalizedDate],
  templateUrl: './stress-sleep-summary.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StressSleepSummaryComponent {
  readonly summary = inject(StressSleepSummary);
  constructor() {
    void this.summary.load();
  }
}
