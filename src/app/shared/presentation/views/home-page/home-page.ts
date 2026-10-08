import { MatButtonModule } from '@angular/material/button';
import { Translate } from '../../../application/i18n';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HomeStore } from '../../../application/home.store';
import { MetricCard } from '../../components/metric-card/metric-card';
import { TrendChart } from '../../components/trend-chart/trend-chart';
import { Feedback } from '../../components/feedback/feedback';
import { Icon } from '../../components/icon/icon';
import { CheckInForm } from '../../../../modules/wellness/presentation/components/check-in-form/check-in-form';
@Component({
  selector: 'pp-home-page',
  imports: [
    MatButtonModule,
    Translate,
    RouterLink,
    MetricCard,
    TrendChart,
    Feedback,
    Icon,
    CheckInForm,
  ],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage {
  readonly store = inject(HomeStore);
  constructor() {
    void this.store.load();
  }
}
