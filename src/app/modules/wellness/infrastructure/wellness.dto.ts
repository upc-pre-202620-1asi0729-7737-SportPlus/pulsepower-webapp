export interface WellnessDto {
  check_ins: {
    id: string;
    date: string;
    mood: number;
    stress: number;
    discomfort: boolean;
    notes: string;
  }[];
  habits: { id: string; name: string; weekly_target: number }[];
  logs: { habit_id: string; date: string }[];
}
