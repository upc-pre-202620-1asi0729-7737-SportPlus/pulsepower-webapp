import { requireDate, DomainError } from '../../../../shared/domain/validation';
import { PlannedActivity } from './planned-activity.entity';

export interface TrainingPlan {
  readonly id: string;
  readonly name: string;
  readonly period?: { readonly from: string; readonly to: string } | null;
  readonly activities: readonly PlannedActivity[];
}

export function setPlanPeriod(plan: TrainingPlan, from: string, to: string): TrainingPlan {
  requireDate(from);
  requireDate(to);
  if (from > to) throw new DomainError('The end date must be on or after the start date.');
  if (plan.activities.some((a) => a.status !== 'Cancelled' && (a.date < from || a.date > to)))
    throw new DomainError('The plan period must include existing activities.');
  return { ...plan, period: { from, to } };
}
export function checkPlanDate(plan: TrainingPlan, date: string): void {
  if (!plan.period) throw new DomainError('Set the plan period before adding activities.');
  if (date < plan.period.from || date > plan.period.to)
    throw new DomainError('The activity must fall within the plan period.');
}
