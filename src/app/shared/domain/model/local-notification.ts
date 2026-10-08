export interface LocalNotification {
  readonly id: string;
  readonly title: string;
  readonly dueAt: string;
  readonly deliveredAt: string | null;
  readonly kind: 'training' | 'sleep' | 'disconnect';
}
