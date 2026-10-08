import { DomainError } from '../validation';
export interface NotificationPreferences {
  readonly trainingEnabled: boolean;
  readonly allowedFrom: string;
  readonly allowedTo: string;
  readonly digitalDisconnectEnabled: boolean;
  readonly digitalDisconnectTime: string;
}
export function notificationPreferences(value: NotificationPreferences): NotificationPreferences {
  if (
    ![value.allowedFrom, value.allowedTo, value.digitalDisconnectTime].every((time) =>
      /^([01]\d|2[0-3]):[0-5]\d$/.test(time),
    )
  )
    throw new DomainError('Choose valid notification times.');
  if (value.allowedFrom === value.allowedTo)
    throw new DomainError('Choose different start and end times.');
  return Object.freeze({ ...value });
}
export function isAllowedTime(value: NotificationPreferences, time: string): boolean {
  return value.allowedFrom < value.allowedTo
    ? time >= value.allowedFrom && time < value.allowedTo
    : time >= value.allowedFrom || time < value.allowedTo;
}
export function defaultNotificationPreferences(): NotificationPreferences {
  return {
    trainingEnabled: false,
    allowedFrom: '08:00',
    allowedTo: '20:00',
    digitalDisconnectEnabled: false,
    digitalDisconnectTime: '21:00',
  };
}
