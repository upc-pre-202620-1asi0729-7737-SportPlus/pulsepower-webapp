import { MatButtonModule } from '@angular/material/button';
import { Translate } from '../../../../../../../../../../../../../Downloads/pulsepower-webapp/src/app/shared/application/i18n';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SubscriptionService } from '../../../application/subscription.service';
import { PageHeading } from '../../../../../../../../../../../../../Downloads/pulsepower-webapp/src/app/shared/presentation/components/page-heading/page-heading';
import { EmptyState } from '../../../../../../../../../../../../../Downloads/pulsepower-webapp/src/app/shared/presentation/components/empty-state/empty-state';
@Component({
  selector: 'pp-subscription',
  imports: [MatButtonModule, Translate, RouterLink, PageHeading, EmptyState],
  templateUrl: './subscription-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SubscriptionPage {
  readonly confirming = signal(false);
  readonly service = inject(SubscriptionService);
  constructor() {
    void this.service.load();
  }
}
