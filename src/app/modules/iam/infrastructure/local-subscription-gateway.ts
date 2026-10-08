import { Injectable, inject } from '@angular/core';
import { SubscriptionGateway } from '../application/subscription.service';
import { SubscriptionOverview } from '../domain/model/subscription-overview';
import { Subscription } from '../domain/model/subscription.entity';
import { BrowserStorage } from '../../../shared/infrastructure/browser-storage';
import { Clock } from '../../../shared/application/clock';
@Injectable()
export class LocalSubscriptionGateway extends SubscriptionGateway {
  private readonly storage = inject(BrowserStorage);
  private readonly clock = inject(Clock);
  async load(): Promise<SubscriptionOverview> {
    let subscription = this.storage.read<Subscription | null>(
      'subscription',
      (v) => v as Subscription,
      () => null,
    );
    if (
      subscription?.cancelAtPeriodEnd &&
      subscription.endsAt &&
      Date.parse(subscription.endsAt) <= this.clock.now().getTime()
    ) {
      subscription = { ...subscription, status: 'Cancelled' };
      this.storage.write('subscription', subscription);
    }
    return {
      available: true,
      plans: [
        { id: 'basic', name: 'Basic', features: [] },
        { id: 'pro', name: 'Pro', features: [] },
      ],
      subscription,
    };
  }
  async activateDemo(): Promise<SubscriptionOverview> {
    const current = (await this.load()).subscription;
    if (current?.status === 'Active') return this.load();
    const endsAt = new Date(this.clock.now().getTime() + 30 * 86400000).toISOString();
    this.storage.write('subscription', {
      id: this.clock.id(),
      planId: 'pro',
      status: 'Active',
      endsAt,
      cancelAtPeriodEnd: false,
    });
    return this.load();
  }
  async cancel(): Promise<SubscriptionOverview> {
    const value = (await this.load()).subscription;
    if (!value || value.status !== 'Active') throw Error('No active subscription.');
    this.storage.write('subscription', { ...value, cancelAtPeriodEnd: true });
    return this.load();
  }
}
