import { Translate } from '../../../application/i18n';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
@Component({
  imports: [Translate],
  selector: 'pp-feedback',
  templateUrl: './feedback.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Feedback {
  readonly error = input<string | null>(null);
  readonly message = input<string | null>(null);
}
