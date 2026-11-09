import { describe, expect, it } from 'vitest';
import { simulateRecovery } from './recovery-simulation';
import {
  DAY_SCENARIOS,
  SimulatedDay,
  simulateDay,
  simulateWeek,
  sleepHours,
} from './wearable-simulation';
const extremes = [() => 0, () => 0.5, () => 0.999999];
const score = (day: SimulatedDay) =>
  simulateRecovery([
    {
      date: day.date,
      sleepHours: day.night ? sleepHours(day.night) : null,
      stress: day.wellness?.stress ?? null,
      effort: day.workout?.perceivedEffort ?? null,
      planned: false,
    },
  ])[0]!.score;
describe('Wearable simulation', () => {
  it('keeps every scenario inside realistic ranges', () => {
    for (const random of extremes)
      for (const scenario of DAY_SCENARIOS) {
        const day = simulateDay(scenario, '2026-10-24', random);
        if (day.night) {
          expect(sleepHours(day.night)).toBeGreaterThanOrEqual(4.5);
          expect(sleepHours(day.night)).toBeLessThanOrEqual(8.5);
          expect(day.night.endedAt.slice(0, 10) <= '2026-10-25').toBe(true);
        }
        if (day.workout) {
          expect(day.workout.perceivedEffort).toBeGreaterThanOrEqual(2);
          expect(day.workout.perceivedEffort).toBeLessThanOrEqual(10);
          expect(Number.isInteger(day.workout.perceivedEffort)).toBe(true);
        }
        if (day.wellness) {
          expect(day.wellness.stress).toBeGreaterThanOrEqual(1);
          expect(day.wellness.stress).toBeLessThanOrEqual(10);
          expect(day.wellness.mood).toBeGreaterThanOrEqual(1);
          expect(day.wellness.mood).toBeLessThanOrEqual(5);
        }
      }
  });
  it('always meets the overload alert conditions on an overload day', () => {
    for (const random of extremes) {
      const day = simulateDay('overloadDay', '2026-10-24', random);
      expect(score(day)).toBeLessThan(40);
      expect(day.workout!.perceivedEffort).toBeGreaterThanOrEqual(7);
    }
  });
  it('only fills the category of a single-signal scenario', () => {
    const day = simulateDay('shortNight', '2026-10-24', () => 0.5);
    expect(day.night).not.toBeNull();
    expect(day.workout).toBeNull();
    expect(day.wellness).toBeNull();
  });
  it('simulates seven consecutive days ending today', () => {
    const week = simulateWeek('2026-10-24', () => 0.3);
    expect(week.map((day) => day.date)).toEqual([
      '2026-10-18',
      '2026-10-19',
      '2026-10-20',
      '2026-10-21',
      '2026-10-22',
      '2026-10-23',
      '2026-10-24',
    ]);
    expect(week.every((day) => day.night && day.wellness)).toBe(true);
  });
});
