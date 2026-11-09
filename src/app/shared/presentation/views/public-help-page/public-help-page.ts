import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { I18n, Translate } from '../../../application/i18n';
import { VisitorContact } from '../../../application/visitor-contact';
import { Feedback } from '../../components/feedback/feedback';
@Component({
  selector: 'pp-public-help-page',
  imports: [
    RouterLink,
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    Translate,
    Feedback,
  ],
  providers: [VisitorContact],
  templateUrl: './public-help-page.html',
  styleUrls: ['../../styles/legal-page.css', './public-help-page.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublicHelpPage {
  readonly i18n = inject(I18n);
  readonly contact = inject(VisitorContact);
  readonly topics = ['about', 'account', 'plans', 'device', 'privacy', 'support'] as const;
  readonly email = signal('');
  readonly message = signal('');
  async send(): Promise<void> {
    if (await this.contact.send(this.email(), this.message())) {
      this.email.set('');
      this.message.set('');
    }
  }
}
