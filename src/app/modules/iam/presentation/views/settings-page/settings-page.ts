import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { IdentityService } from '../../../application/identity.service';
import { Translate } from '../../../../../../../../../../../../../Downloads/pulsepower-webapp/src/app/shared/application/i18n';
import {
  NotificationPreferencesStore,
  NotificationPreferencesCommand,
} from '../../../../../../../../../../../../../Downloads/pulsepower-webapp/src/app/shared/application/notification-preferences.store';
import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ProfileStore, ProfileCommand } from '../../../application/profile.store';
import { PageHeading } from '../../../../../../../../../../../../../Downloads/pulsepower-webapp/src/app/shared/presentation/components/page-heading/page-heading';
import { EmptyState } from '../../../../../../../../../../../../../Downloads/pulsepower-webapp/src/app/shared/presentation/components/empty-state/empty-state';
import { Feedback } from '../../../../../../../../../../../../../Downloads/pulsepower-webapp/src/app/shared/presentation/components/feedback/feedback';
import { Icon } from '../../../../../../../../../../../../../Downloads/pulsepower-webapp/src/app/shared/presentation/components/icon/icon';
@Component({
  selector: 'pp-settings-page',
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    Translate,
    FormsModule,
    RouterLink,
    PageHeading,
    EmptyState,
    Feedback,
    Icon,
  ],
  templateUrl: './settings-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsPage {
  readonly identity = inject(IdentityService);
  private readonly router = inject(Router);
  readonly deleting = signal(false);
  readonly deleteConfirmed = signal(false);
  async deleteAccount(): Promise<void> {
    if (this.deleteConfirmed() && (await this.identity.deleteCurrent())) {
      await this.router.navigateByUrl('/sign-in');
      this.identity.reloadDemo();
    }
  }
  readonly notifications = inject(NotificationPreferencesStore);
  notificationForm: NotificationPreferencesCommand = { ...this.notifications.preferences() };
  simulationTime = '21:00';
  readonly store = inject(ProfileStore);
  readonly tab = signal<'profile' | 'notifications' | 'device'>('profile');
  form: ProfileCommand = {
    displayName: '',
    focus: 'Athlete',
    age: null,
    weightKg: null,
    heightCm: null,
    mainSport: '',
  };
  goal = '';
  constructor() {
    void this.notifications.load();
    effect(() => {
      this.notificationForm = { ...this.notifications.preferences() };
    });
    void this.store.load();
    effect(() => {
      const profile = this.store.profile();
      if (profile) this.form = { ...profile };
    });
  }
  async addGoal(): Promise<void> {
    if (await this.store.addGoal(this.goal)) this.goal = '';
  }
}
