import { NotificationPreferences } from '../../domain/model/notification-preferences';
export abstract class NotificationPreferencesRepository {
  abstract load(): Promise<NotificationPreferences>;
  abstract save(value: NotificationPreferences): Promise<void>;
}
