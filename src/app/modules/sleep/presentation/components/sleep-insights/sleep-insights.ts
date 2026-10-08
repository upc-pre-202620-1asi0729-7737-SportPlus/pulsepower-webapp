import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { SleepInsights } from '../../../application/sleep-insights';
import { Translate } from '../../../../../shared/application/i18n';
import { LineChart } from '../../../../../shared/presentation/components/line-chart/line-chart';
@Component({
  selector: 'pp-sleep-insights',
  imports: [Translate, LineChart],
  templateUrl: './sleep-insights.html',
  styleUrl: './sleep-insights.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SleepInsightsComponent {
  readonly insights = inject(SleepInsights);
}
