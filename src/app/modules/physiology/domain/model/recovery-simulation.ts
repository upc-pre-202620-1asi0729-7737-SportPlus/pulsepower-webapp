export interface RecoveryInput {
  readonly date: string;
  readonly sleepHours: number | null;
  readonly stress: number | null;
  readonly effort: number | null;
  readonly planned: boolean;
}
export interface SimulatedRecovery extends RecoveryInput {
  readonly score: number | null;
}
// TODO: replace these demonstration weights and thresholds with the approved physiological model.
export function simulateRecovery(rows: readonly RecoveryInput[]): SimulatedRecovery[] {
  return rows.map((row) => ({
    ...row,
    score:
      row.sleepHours === null
        ? null
        : Math.max(
            0,
            Math.min(
              100,
              Math.round(
                (row.sleepHours / 8) * 100 - (row.stress ?? 0) * 2 - (row.effort ?? 0) * 2,
              ),
            ),
          ),
  }));
}
export function compareRecovery(rows: readonly SimulatedRecovery[]) {
  const mean = (values: readonly SimulatedRecovery[]) => {
    const scores = values.flatMap((r) => (r.score === null ? [] : [r.score]));
    return scores.length === 7 ? scores.reduce((a, b) => a + b, 0) / 7 : null;
  };
  const current = mean(rows.slice(-7)),
    previous = mean(rows.slice(-14, -7));
  return {
    current,
    previous,
    variation:
      current !== null && previous !== null && previous !== 0
        ? Math.round(((current - previous) / previous) * 1000) / 10
        : null,
  };
}
export function insufficientSleep(rows: readonly RecoveryInput[], minimum: number): boolean {
  return (
    rows.length >= 3 && rows.slice(-3).every((r) => r.sleepHours !== null && r.sleepHours < minimum)
  );
}
