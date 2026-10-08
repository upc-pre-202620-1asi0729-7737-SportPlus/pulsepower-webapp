import { LocalNotification } from '../../domain/model/local-notification';
export abstract class NotificationInbox {
  abstract load(): readonly LocalNotification[];
  abstract save(rows: readonly LocalNotification[]): void;
}
