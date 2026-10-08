import { Translate } from '../../../application/i18n';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Icon, IconName } from '../icon/icon';
@Component({
  selector: 'pp-empty-state',
  imports: [Translate, Icon],
  templateUrl: './empty-state.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyState {
  readonly icon = input<IconName>('reports');
  readonly title = input('A fresh start');
  readonly description = input('Your records will appear here.');
}
