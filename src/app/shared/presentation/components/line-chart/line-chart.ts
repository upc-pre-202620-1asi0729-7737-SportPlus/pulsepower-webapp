import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { ChartSeries, chartSegments } from '../../../application/chart-series';
import { Translate } from '../../../application/i18n';

@Component({
  selector: 'pp-line-chart',
  imports: [Translate],
  templateUrl: './line-chart.html',
  styleUrl: './line-chart.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LineChart {
  readonly series = input.required<readonly ChartSeries[]>();
  readonly area = input(false);
  readonly normalized = input(false);
  readonly description = input.required<string>();
  readonly charts = computed(() =>
    this.series().map((series) => ({
      ...series,
      segments: chartSegments(series, this.normalized()),
    })),
  );
  readonly hasData = computed(() => this.charts().some((series) => series.segments.length));
  readonly labels = computed(() => this.series()[0]?.points.map((p) => p.label) ?? []);
}
