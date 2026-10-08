import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { Translate, LocalizedDate } from '../../../../../../../../../../../../../Downloads/pulsepower-webapp/src/app/shared/application/i18n';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommunityStore } from '../../../application/community.store';
import { PageHeading } from '../../../../../../../../../../../../../Downloads/pulsepower-webapp/src/app/shared/presentation/components/page-heading/page-heading';
import { MetricCard } from '../../../../../../../../../../../../../Downloads/pulsepower-webapp/src/app/shared/presentation/components/metric-card/metric-card';
import { EmptyState } from '../../../../../../../../../../../../../Downloads/pulsepower-webapp/src/app/shared/presentation/components/empty-state/empty-state';
import { FormDialog } from '../../../../../../../../../../../../../Downloads/pulsepower-webapp/src/app/shared/presentation/components/form-dialog/form-dialog';
import { Feedback } from '../../../../../../../../../../../../../Downloads/pulsepower-webapp/src/app/shared/presentation/components/feedback/feedback';
import { Icon } from '../../../../../../../../../../../../../Downloads/pulsepower-webapp/src/app/shared/presentation/components/icon/icon';
@Component({
  selector: 'pp-community-page',
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    Translate,
    FormsModule,
    LocalizedDate,
    PageHeading,
    MetricCard,
    EmptyState,
    FormDialog,
    Feedback,
    Icon,
  ],
  templateUrl: './community-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommunityPage {
  readonly store = inject(CommunityStore);
  title = '';
  content = '';
  removeId: string | null = null;
  constructor() {
    void this.store.load();
  }
  async save(dialog: FormDialog): Promise<void> {
    if (await this.store.save(this.title, this.content)) {
      this.title = '';
      this.content = '';
      dialog.close();
    }
  }
  confirmRemove(id: string, dialog: FormDialog): void {
    this.removeId = id;
    dialog.open();
  }
  async remove(dialog: FormDialog): Promise<void> {
    if (this.removeId && (await this.store.remove(this.removeId))) dialog.close();
  }
}
