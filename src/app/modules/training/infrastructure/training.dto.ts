export interface TrainingSessionDto {
  id: string;
  date: string;
  activity: string;
  duration_minutes: number;
  perceived_effort: number;
  notes: string;
  planned_activity_id: string | null;
}
export interface PlannedActivityDto {
  start_time?: string | null;
  id: string;
  date: string;
  activity: string;
  duration_minutes: number;
  intensity: string;
  kind: string;
  status: string;
}
export interface TrainingDto {
  sessions: TrainingSessionDto[];
  plan: {
    period?: { from: string; to: string } | null;
    id: string;
    name: string;
    activities: PlannedActivityDto[];
  };
}
