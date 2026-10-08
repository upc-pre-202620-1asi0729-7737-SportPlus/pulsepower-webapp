export interface Subscription {
  readonly id: string;
  readonly planId: string;
  readonly status: 'Active' | 'Cancelled';
  readonly cancelAtPeriodEnd?: boolean;
  readonly endsAt: string | null;
}
