import { Translate } from '../../../application/i18n';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
@Component({
  imports: [Translate],
  selector: 'pp-page-heading',
  templateUrl: './page-heading.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageHeading {
  readonly eyebrow = input('YOUR PULSEPOWER');
  readonly title = input.required<string>();
  readonly description = input('');
}
