import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HelpStore } from '../../../application/help.store';
import { Translate } from '../../../application/i18n';
import { PageHeading } from '../../components/page-heading/page-heading';
import { Feedback } from '../../components/feedback/feedback';
@Component({
  selector: 'pp-help-page',
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    RouterLink,
    Translate,
    PageHeading,
    Feedback,
  ],
  templateUrl: './help-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HelpPage {
  readonly store = inject(HelpStore);
  description = '';
  constructor() {
    void this.store.load();
  }
}
