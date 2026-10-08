import { describe, expect, it } from 'vitest';
import { compareRecovery, insufficientSleep, simulateRecovery } from './recovery-simulation';
describe('Demonstration recovery rules', () => {
  const row = { date: '2026-10-07', sleepHours: 8, stress: 2, effort: 3, planned: true };
  it('responds to changed records without manufacturing missing measurements', () => {
    const values = simulateRecovery([row, { ...row, sleepHours: 4 }, { ...row, sleepHours: null }]);
    expect(values[0]!.score).toBeGreaterThan(values[1]!.score!);
    expect(values[2]!.score).toBeNull();
    expect(simulateRecovery([{ ...row, sleepHours: 24 }])[0]!.score).toBe(100);
  });
  it('does not emit a three-night alert when a night is missing', () => {
    expect(
      insufficientSleep(
        [
          { ...row, sleepHours: 4 },
          { ...row, sleepHours: null },
          { ...row, sleepHours: 4 },
        ],
        8,
      ),
    ).toBe(false);
    expect(
      insufficientSleep(
        Array.from({ length: 3 }, () => ({ ...row, sleepHours: 4 })),
        8,
      ),
    ).toBe(true);
  });
  it('requires both complete weeks and avoids division by zero', () => {
    const rows = simulateRecovery(Array.from({ length: 14 }, () => row));
    expect(compareRecovery(rows).variation).toBe(0);
    expect(compareRecovery(rows.slice(1)).variation).toBeNull();
    expect(compareRecovery(rows.map((r) => ({ ...r, score: 0 }))).variation).toBeNull();
  });
});
