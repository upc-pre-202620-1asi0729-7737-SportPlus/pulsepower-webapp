import { ActionState } from '../../../../../../../../../../../Downloads/pulsepower-webapp/src/app/shared/application/action-state';
import { Injectable, inject, signal } from '@angular/core';
import { SubscriptionOverview } from '../domain/model/subscription-overview';
export abstract class SubscriptionGateway {
  abstract load(): Promise<SubscriptionOverview>;
  abstract cancel(): Promise<SubscriptionOverview>;
  abstract activateDemo(): Promise<SubscriptionOverview>;
}
@Injectable({ providedIn: 'root' })
export class SubscriptionService extends ActionState {
  cancel(): Promise<boolean> {
    return this.execute(async () => this.state.set(await this.gateway.cancel()));
  }
  activateDemo(): Promise<boolean> {
    return this.execute(async () => this.state.set(await this.gateway.activateDemo()));
  }
  private readonly gateway = inject(SubscriptionGateway);
  private readonly state = signal<SubscriptionOverview>({
    plans: [],
    subscription: null,
    available: false,
  });
  readonly overview = this.state.asReadonly();
  async load(): Promise<void> {
    this.state.set(await this.gateway.load());
  }
}
