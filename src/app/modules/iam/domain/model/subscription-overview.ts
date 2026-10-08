import { SubscriptionPlan } from './subscription-plan.entity';
import { Subscription } from './subscription.entity';

export interface SubscriptionOverview {
  readonly plans: readonly SubscriptionPlan[];
  readonly subscription: Subscription | null;
  readonly available: boolean;
}
