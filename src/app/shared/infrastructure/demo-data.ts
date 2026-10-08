import { TrainingAssembler } from '../../modules/training/infrastructure/training-assembler';
import { SleepAssembler } from '../../modules/sleep/infrastructure/sleep-assembler';
import { WellnessAssembler } from '../../modules/wellness/infrastructure/wellness-assembler';
import { CommunityAssembler } from '../../modules/community/infrastructure/community-assembler';
import { ProfileAssembler } from '../../modules/iam/infrastructure/profile-assembler';
import { BrowserStorage } from './browser-storage';
import { Clock } from '../application/clock';
import { lastDays, localDate } from '../application/calendar';
import { plannedActivity } from '../../modules/training/domain/model/planned-activity.entity';
import { trainingSession } from '../../modules/training/domain/model/training-session.entity';
import { sleepRecord } from '../../modules/sleep/domain/model/sleep-record.entity';
import { sleepRoutine } from '../../modules/sleep/domain/model/sleep-routine';
import { wellnessCheckIn } from '../../modules/wellness/domain/model/wellness-check-in.entity';
import { wellnessHabit } from '../../modules/wellness/domain/model/wellness-habit.entity';
import { userProfile } from '../../modules/iam/domain/model/user-profile.entity';

export function demoData(now: Date): Readonly<Record<string, unknown>> {
  const days = lastDays(localDate(now), 30);
  const activities = ['Morning run', 'Strength training', 'Evening walk'];
  const sessions = days.map((date, i) =>
    trainingSession({
      id: `demo-session-${date}`,
      date,
      activity: activities[i % activities.length]!,
      durationMinutes: [35, 50, 25, 40, 45, 30, 40][i % 7]!,
      perceivedEffort: [5, 7, 3, 6, 6, 4, 5][i % 7]!,
      notes: 'Example record',
      plannedActivityId: null,
    }),
  );
  const planned = [0, 1, 2, 4, 6].map((offset, i) => {
    const date = new Date(now);
    date.setDate(date.getDate() + offset);
    return plannedActivity({
      id: `demo-planned-${i}`,
      date: localDate(date),
      startTime: '18:00',
      activity: i === 1 ? 'Mobility and stretching' : activities[i % activities.length]!,
      durationMinutes: i === 1 ? 20 : 40,
      intensity: i === 1 ? 'Low' : 'Medium',
      kind: i === 1 ? 'Active rest' : 'Workout',
      status: 'Planned',
    });
  });
  const records = days.map((date, i) => {
    const end = new Date(date + 'T07:00:00');
    const start = new Date(end.getTime() - [7.5, 8, 7, 8.2, 7.8, 8.5, 7.6][i % 7]! * 3600000);
    return sleepRecord({
      id: `demo-sleep-${date}`,
      startedAt: start.toISOString(),
      endedAt: end.toISOString(),
      source: 'MANUAL',
      sleepScore: null,
      notes: 'Example record',
    });
  });
  const habits = ['Drink water regularly', 'Read before bed', 'Take a mindful break'].map(
    (name, i) => wellnessHabit({ id: `demo-habit-${i}`, name, weeklyTarget: i === 0 ? 7 : 5 }),
  );
  return {
    profile: ProfileAssembler.toDto(
      userProfile({
        displayName: 'Alex Lopez',
        focus: 'Athlete',
        age: 25,
        weightKg: 72,
        heightCm: 175,
        mainSport: 'Running',
        goals: [
          { id: 'demo-goal-1', description: 'Keep a consistent sleep routine', completed: false },
          { id: 'demo-goal-2', description: 'Move three times a week', completed: true },
        ],
      }),
    ),
    training: TrainingAssembler.toDto({
      sessions,
      plan: { id: 'demo-plan', name: 'Demo training plan', activities: planned },
    }),
    sleep: SleepAssembler.toDto({
      records,
      routine: sleepRoutine({
        bedtime: '23:00',
        wakeTime: '07:00',
        targetHours: 8,
        reminderEnabled: false,
      }),
    }),
    wellness: WellnessAssembler.toDto({
      habits,
      checkIns: days.map((date, i) =>
        wellnessCheckIn({
          id: `demo-check-in-${date}`,
          date,
          mood: [4, 3, 5, 4, 4, 5, 4][i % 7]!,
          stress: [4, 6, 3, 5, 4, 2, 3][i % 7]!,
          discomfort: false,
          notes: 'Example record',
        }),
      ),
      logs: days.flatMap((date, i) =>
        habits.filter((_, h) => (i + h) % 3 !== 0).map((habit) => ({ habitId: habit.id, date })),
      ),
    }),
    community: [
      CommunityAssembler.toDto({
        id: 'demo-progress',
        title: 'My first two weeks',
        content: 'I am building a steady routine of movement, rest and daily check-ins.',
        visibility: 'Private',
        createdAt: now.toISOString(),
      }),
    ],
  };
}

export function initializeDemo(storage: BrowserStorage, clock: Clock): void {
  if (!storage.isDemo) return;
  const examples = demoData(clock.now());
  for (const [key, value] of Object.entries(examples)) storage.seed(key, value);

  // Extend the demo history without replacing records edited during a presentation.
  const sleep = storage.read('sleep', SleepAssembler.toDomain, () =>
    SleepAssembler.toDomain(examples['sleep']),
  );
  const sampleSleep = SleepAssembler.toDomain(examples['sleep']);
  const newNights = sampleSleep.records.filter(
    (night) =>
      !sleep.records.some(
        (saved) =>
          localDate(new Date(saved.endedAt)) === localDate(new Date(night.endedAt)) ||
          (Date.parse(saved.startedAt) < Date.parse(night.endedAt) &&
            Date.parse(night.startedAt) < Date.parse(saved.endedAt)),
      ),
  );
  if (newNights.length)
    storage.write(
      'sleep',
      SleepAssembler.toDto({ ...sleep, records: [...sleep.records, ...newNights] }),
    );

  const training = storage.read('training', TrainingAssembler.toDomain, () =>
    TrainingAssembler.toDomain(examples['training']),
  );
  const newSessions = TrainingAssembler.toDomain(examples['training']).sessions.filter(
    (session) =>
      !training.sessions.some((saved) => saved.date === session.date) &&
      !training.plan.activities.some(
        (activity) =>
          activity.date === session.date &&
          activity.kind === 'Active rest' &&
          activity.status !== 'Cancelled',
      ),
  );
  if (newSessions.length)
    storage.write(
      'training',
      TrainingAssembler.toDto({ ...training, sessions: [...training.sessions, ...newSessions] }),
    );

  const wellness = storage.read('wellness', WellnessAssembler.toDomain, () =>
    WellnessAssembler.toDomain(examples['wellness']),
  );
  const newCheckIns = WellnessAssembler.toDomain(examples['wellness']).checkIns.filter(
    (checkIn) => !wellness.checkIns.some((saved) => saved.date === checkIn.date),
  );
  if (newCheckIns.length)
    storage.write(
      'wellness',
      WellnessAssembler.toDto({ ...wellness, checkIns: [...wellness.checkIns, ...newCheckIns] }),
    );
}
