export interface UserProfileDto {
  display_name: string;
  focus: 'Athlete' | 'Wellness Seeker';
  age: number | null;
  weight_kg: number | null;
  height_cm: number | null;
  main_sport: string;
  training_routine?: string;
  physical_history?: string;
  goals: { id: string; description: string; completed: boolean }[];
}
