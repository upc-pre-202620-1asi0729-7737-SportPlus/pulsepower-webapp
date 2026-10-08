export interface SleepRecordDto {
  id: string;
  started_at: string;
  ended_at: string;
  source: string;
  sleep_score: number | null;
  notes: string;
}
export interface SleepRoutineDto {
  bedtime: string;
  wake_time: string;
  target_hours: number;
  reminder_enabled: boolean;
}
export interface SleepDto {
  records: SleepRecordDto[];
  routine: SleepRoutineDto | null;
}
