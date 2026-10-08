import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { Translate } from '../../../../../../../../../../../../../Downloads/pulsepower-webapp/src/app/shared/application/i18n';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthLayout } from '../../components/auth-layout/auth-layout';
import { IdentityService } from '../../../application/identity.service';
@Component({
  selector: 'pp-sign-in',
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    Translate,
    RouterLink,
    FormsModule,
    AuthLayout,
  ],
  templateUrl: './sign-in-page.html',
  styleUrl: '../../styles/auth-form.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignInPage {
  readonly identity = inject(IdentityService);
  private readonly router = inject(Router);
  readonly showPassword = signal(false);
  readonly recoveryNotice = signal(false);
  email = '';
  password = '';
  async enterPreview(): Promise<void> {
    const accepted = await this.identity.signIn(this.email, this.password);
    this.password = '';
    if (!accepted) return;
    this.email = '';
    this.identity.restoreDraft();
    if (await this.router.navigateByUrl(this.identity.draft() ? '/sign-up' : '/home'))
      this.identity.reloadDemo();
  }
}
