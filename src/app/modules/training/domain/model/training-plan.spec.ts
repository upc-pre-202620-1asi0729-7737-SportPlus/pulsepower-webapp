import { expect, it } from 'vitest';
import { setPlanPeriod, checkPlanDate } from './training-plan.entity';
it('rejects activities outside the configured plan and inverted periods', () => {
  const plan = { id: '1', name: 'Plan', activities: [] };
  expect(() => setPlanPeriod(plan, '2026-10-08', '2026-10-07')).toThrow();
  const valid = setPlanPeriod(plan, '2026-10-01', '2026-10-07');
  expect(() => checkPlanDate(valid, '2026-10-07')).not.toThrow();
  expect(() => checkPlanDate(valid, '2026-10-08')).toThrow();
});
