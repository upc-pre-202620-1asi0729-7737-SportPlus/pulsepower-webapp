import { Translate } from '../../../application/i18n';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Icon, IconName } from '../icon/icon';
@Component({
  selector: 'pp-metric-card',
  imports: [Translate, Icon],
  templateUrl: './metric-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MetricCard {
  readonly label = input.required<string>();
  readonly value = input.required<string | number>();
  readonly unit = input('');
  readonly detail = input('');
  readonly icon = input<IconName>('pulse');
  readonly tone = input<'default' | 'mint' | 'lavender'>('default');
}
