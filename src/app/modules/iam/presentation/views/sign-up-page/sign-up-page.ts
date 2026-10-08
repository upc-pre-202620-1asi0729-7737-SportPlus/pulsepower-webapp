import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Translate } from '../../../../../shared/application/i18n';
import { IdentityService } from '../../../application/identity.service';
import { AuthLayout } from '../../components/auth-layout/auth-layout';

@Component({
  selector: 'pp-sign-up',
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    FormsModule,
    RouterLink,
    Translate,
    AuthLayout,
  ],
  templateUrl: './sign-up-page.html',
  styleUrl: '../../styles/auth-form.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignUpPage {
  private readonly router = inject(Router);
  readonly identity = inject(IdentityService);
  readonly showPassword = signal(false);
  readonly showConfirmation = signal(false);
  fullName = '';
  email = '';
  password = '';
  confirmation = '';
  constructor() {
    this.identity.resetRegistration();
    this.identity.restoreDraft();
  }
  async continue(): Promise<void> {
    if (await this.identity.register(this.fullName, this.email, this.password, this.confirmation)) {
      this.password = '';
      this.confirmation = '';
    }
  }
  async finish(): Promise<void> {
    if (await this.identity.complete()) {
      await this.router.navigateByUrl('/home');
      this.identity.reloadDemo();
    }
  }
}
