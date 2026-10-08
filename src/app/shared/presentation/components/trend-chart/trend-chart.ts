import { Translate } from '../../../application/i18n';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { ChartPoint } from '../../../application/chart-point';
@Component({
  imports: [Translate],
  selector: 'pp-trend-chart',
  templateUrl: './trend-chart.html',
  styleUrl: './trend-chart.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrendChart {
  readonly points = input.required<readonly ChartPoint[]>();
  readonly color = input('var(--turquoise)');
  readonly description = input('');
  readonly hasData = computed(() => this.points().some((point) => point.value !== null));
  readonly hasMissing = computed(() => this.points().some((point) => point.value === null));
  height(value: number | null): number {
    const max = Math.max(1, ...this.points().map((point) => point.value ?? 0));
    return value === null ? 0 : (value / max) * 100;
  }
}
