import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { WellnessCheckIn } from '../../../application/wellness.store';
import { Translate, LocalizedDate } from '../../../../../shared/application/i18n';
import { EmptyState } from '../../../../../shared/presentation/components/empty-state/empty-state';
@Component({
  selector: 'pp-check-in-list',
  imports: [Translate, LocalizedDate, EmptyState],
  templateUrl: './check-in-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckInList {
  readonly checkIns = input.required<readonly WellnessCheckIn[]>();
}
