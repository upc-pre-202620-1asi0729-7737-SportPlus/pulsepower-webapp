import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TrainingSession } from '../../../application/training.store';
import { Translate, LocalizedDate } from '../../../../../shared/application/i18n';
import { EmptyState } from '../../../../../shared/presentation/components/empty-state/empty-state';
@Component({
  selector: 'pp-session-list',
  imports: [Translate, LocalizedDate, EmptyState],
  templateUrl: './session-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SessionList {
  readonly sessions = input.required<readonly TrainingSession[]>();
  readonly busy = input(false);
}
