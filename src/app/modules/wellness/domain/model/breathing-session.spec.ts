import { expect, it } from 'vitest';
import { finishBreathing } from './breathing-session';
it('only completes a full, uninterrupted breathing session', () => {
  expect(finishBreathing('1', 0, 59999, false).completed).toBe(false);
  expect(finishBreathing('1', 0, 60000, false).completed).toBe(true);
  expect(finishBreathing('1', 0, 60001, true).completed).toBe(false);
});
