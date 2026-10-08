export interface BreathingSession {
  readonly id: string;
  readonly startedAt: string;
  readonly endedAt: string;
  readonly completed: boolean;
}
export function finishBreathing(
  id: string,
  startedAt: number,
  endedAt: number,
  interrupted: boolean,
): BreathingSession {
  return {
    id,
    startedAt: new Date(startedAt).toISOString(),
    endedAt: new Date(endedAt).toISOString(),
    completed: !interrupted && endedAt - startedAt >= 60000,
  };
}
