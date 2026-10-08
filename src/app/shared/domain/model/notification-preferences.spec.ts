import { describe, expect, it } from 'vitest';
import {
  defaultNotificationPreferences,
  notificationPreferences,
  isAllowedTime,
} from './notification-preferences';
describe('Notification preference windows', () => {
  it('supports overnight windows with an exclusive end', () => {
    const value = notificationPreferences({
      ...defaultNotificationPreferences(),
      allowedFrom: '22:00',
      allowedTo: '06:00',
    });
    expect(isAllowedTime(value, '23:00')).toBe(true);
    expect(isAllowedTime(value, '03:00')).toBe(true);
    expect(isAllowedTime(value, '06:00')).toBe(false);
    expect(isAllowedTime(value, '12:00')).toBe(false);
  });
  it('rejects invalid or ambiguous windows', () => {
    expect(() =>
      notificationPreferences({ ...defaultNotificationPreferences(), allowedFrom: '25:00' }),
    ).toThrow();
    expect(() =>
      notificationPreferences({ ...defaultNotificationPreferences(), allowedFrom: '20:00' }),
    ).toThrow();
  });
});
