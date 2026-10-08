import { RouterLink } from '@angular/router';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { I18n, Translate } from '../../../../../../../../../../../../../Downloads/pulsepower-webapp/src/app/shared/application/i18n';

@Component({
  selector: 'pp-auth-layout',
  imports: [RouterLink, Translate],
  templateUrl: './auth-layout.html',
  styleUrl: './auth-layout.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthLayout {
  readonly i18n = inject(I18n);
}
