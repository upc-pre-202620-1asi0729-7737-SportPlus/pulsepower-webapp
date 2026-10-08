import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { Translate } from '../../../application/i18n';
import { LegalNavigation } from '../../../application/legal-navigation';
@Component({
  selector: 'pp-terms-page',
  imports: [RouterLink, Translate, MatButtonModule],
  templateUrl: './terms-page.html',
  styleUrl: '../../styles/legal-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TermsPage {
  readonly navigation = inject(LegalNavigation);
  constructor() {
    void this.navigation.initialize();
  }
}
