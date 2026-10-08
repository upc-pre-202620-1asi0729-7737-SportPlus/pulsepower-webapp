import { Injectable, inject } from '@angular/core';
import { NotificationPreferencesRepository } from '../application/ports/notification-preferences-repository';
import {
  NotificationPreferences,
  notificationPreferences,
  defaultNotificationPreferences,
} from '../domain/model/notification-preferences';
import { BrowserStorage, asRecord, textField } from './browser-storage';
interface NotificationPreferencesDto {
  training_enabled: boolean;
  allowed_from: string;
  allowed_to: string;
  digital_disconnect_enabled: boolean;
  digital_disconnect_time: string;
}
@Injectable()
export class LocalNotificationPreferencesRepository extends NotificationPreferencesRepository {
  private readonly storage = inject(BrowserStorage);
  async load(): Promise<NotificationPreferences> {
    return this.storage.read(
      'notification-preferences',
      (value) => {
        const dto = asRecord(value);
        if (
          typeof dto['training_enabled'] !== 'boolean' ||
          typeof dto['digital_disconnect_enabled'] !== 'boolean'
        )
          throw new Error('Invalid saved object.');
        return notificationPreferences({
          trainingEnabled: dto['training_enabled'],
          allowedFrom: textField(dto, 'allowed_from'),
          allowedTo: textField(dto, 'allowed_to'),
          digitalDisconnectEnabled: dto['digital_disconnect_enabled'],
          digitalDisconnectTime: textField(dto, 'digital_disconnect_time'),
        });
      },
      defaultNotificationPreferences,
    );
  }
  async save(value: NotificationPreferences): Promise<void> {
    const dto: NotificationPreferencesDto = {
      training_enabled: value.trainingEnabled,
      allowed_from: value.allowedFrom,
      allowed_to: value.allowedTo,
      digital_disconnect_enabled: value.digitalDisconnectEnabled,
      digital_disconnect_time: value.digitalDisconnectTime,
    };
    this.storage.write('notification-preferences', dto);
  }
}
