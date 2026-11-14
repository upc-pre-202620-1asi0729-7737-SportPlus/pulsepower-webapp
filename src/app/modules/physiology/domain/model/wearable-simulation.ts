/**
 * Generates realistic wearable readings for the academic prototype. There is no real
 * device: each scenario produces values inside plausible ranges so the rest of the
 * platform (recovery level, alerts and the recovery guide) can react to them.
 */
export type DayScenario =
  | 'restfulNight'
  | 'shortNight'
  | 'intenseWorkout'
  | 'lightWorkout'
  | 'stressfulDay'
  | 'calmDay'
  | 'overloadDay';
export const DAY_SCENARIOS: readonly DayScenario[] = [
  'restfulNight',
  'shortNight',
  'intenseWorkout',
  'lightWorkout',
  'stressfulDay',
  'calmDay',
  'overloadDay',
];
/** Returns a number in [0, 1), like Math.random. */
export type Random = () => number;
export interface SimulatedNight {
  readonly startedAt: string;
  readonly endedAt: string;
  readonly sleepScore: number;
}
export interface SimulatedWorkout {
  readonly activity: string;
  readonly durationMinutes: number;
  readonly perceivedEffort: number;
}
export interface SimulatedWellness {
  readonly mood: number;
  readonly stress: number;
}
export interface SimulatedDay {
  readonly date: string;
  readonly scenario: DayScenario | 'typicalDay';
  readonly night: SimulatedNight | null;
  readonly workout: SimulatedWorkout | null;
  readonly wellness: SimulatedWellness | null;
}
function between(random: Random, min: number, max: number): number {
  return min + random() * (max - min);
}
function whole(random: Random, min: number, max: number): number {
  return Math.min(max, Math.floor(between(random, min, max + 1)));
}
function pick<T>(random: Random, values: readonly T[]): T {
  return values[Math.min(values.length - 1, Math.floor(random() * values.length))]!;
}
function night(
  date: string,
  random: Random,
  hours: readonly [number, number],
  score: readonly [number, number],
): SimulatedNight {
  const wake = new Date(date + 'T07:00:00');
  wake.setMinutes(wake.getMinutes() + whole(random, -30, 30));
  const duration = Math.round(between(random, hours[0], hours[1]) * 60) * 60000;
  return {
    startedAt: new Date(wake.getTime() - duration).toISOString(),
    endedAt: wake.toISOString(),
    sleepScore: whole(random, score[0], score[1]),
  };
}
const restful = (date: string, random: Random) => night(date, random, [7.5, 8.5], [80, 95]);
const short = (date: string, random: Random) => night(date, random, [4.5, 5.5], [35, 55]);
const intense = (random: Random): SimulatedWorkout => ({
  activity: pick(random, ['Interval run', 'Strength training']),
  durationMinutes: whole(random, 55, 90),
  perceivedEffort: whole(random, 8, 10),
});
const light = (random: Random): SimulatedWorkout => ({
  activity: pick(random, ['Easy walk', 'Evening walk']),
  durationMinutes: whole(random, 20, 40),
  perceivedEffort: whole(random, 2, 4),
});
const stressful = (random: Random): SimulatedWellness => ({
  mood: whole(random, 1, 2),
  stress: whole(random, 8, 10),
});
const calm = (random: Random): SimulatedWellness => ({
  mood: whole(random, 4, 5),
  stress: whole(random, 1, 3),
});
export function simulateDay(scenario: DayScenario, date: string, random: Random): SimulatedDay {
  const day = { date, scenario, night: null, workout: null, wellness: null };
  switch (scenario) {
    case 'restfulNight':
      return { ...day, night: restful(date, random) };
    case 'shortNight':
      return { ...day, night: short(date, random) };
    case 'intenseWorkout':
      return { ...day, workout: intense(random) };
    case 'lightWorkout':
      return { ...day, workout: light(random) };
    case 'stressfulDay':
      return { ...day, wellness: stressful(random) };
    case 'calmDay':
      return { ...day, wellness: calm(random) };
    case 'overloadDay':
      return {
        ...day,
        night: short(date, random),
        workout: intense(random),
        wellness: stressful(random),
      };
  }
}
function previousDays(today: string, count: number): string[] {
  return Array.from({ length: count }, (_, index) => {
    const day = new Date(today + 'T12:00:00');
    day.setDate(day.getDate() - (count - 1 - index));
    return [
      day.getFullYear(),
      String(day.getMonth() + 1).padStart(2, '0'),
      String(day.getDate()).padStart(2, '0'),
    ].join('-');
  });
}
/** Seven ordinary days ending today, so a new account has history to analyse. */
export function simulateWeek(today: string, random: Random): SimulatedDay[] {
  return previousDays(today, 7).map((date) => ({
    date,
    scenario: 'typicalDay',
    night: night(date, random, [6, 8.5], [55, 90]),
    workout:
      random() < 0.6
        ? {
            activity: pick(random, ['Morning run', 'Strength training', 'Evening walk']),
            durationMinutes: whole(random, 25, 70),
            perceivedEffort: whole(random, 3, 8),
          }
        : null,
    wellness: { mood: whole(random, 2, 5), stress: whole(random, 2, 7) },
  }));
}
export function sleepHours(value: SimulatedNight): number {
  return (
    Math.round(((Date.parse(value.endedAt) - Date.parse(value.startedAt)) / 3600000) * 10) / 10
  );
}
