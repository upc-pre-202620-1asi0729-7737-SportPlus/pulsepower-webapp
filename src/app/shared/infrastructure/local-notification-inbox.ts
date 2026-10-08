import { Injectable, inject } from '@angular/core';
import { BrowserStorage, asArray, asRecord, textField } from './browser-storage';
import { NotificationInbox } from '../application/ports/notification-inbox';
import { LocalNotification } from '../domain/model/local-notification';
import { requireChoice } from '../domain/validation';
interface NotificationDto {
  id: string;
  title: string;
  due_at: string;
  delivered_at: string | null;
  kind: string;
}
function toDomain(value: unknown): LocalNotification {
  const row = asRecord(value);
  return {
    id: textField(row, 'id'),
    title: textField(row, 'title'),
    dueAt: textField(row, 'due_at'),
    deliveredAt: row['delivered_at'] === null ? null : textField(row, 'delivered_at'),
    kind: requireChoice(
      textField(row, 'kind'),
      ['training', 'sleep', 'disconnect'],
      'notification kind',
    ),
  };
}
function toDto(row: LocalNotification): NotificationDto {
  return {
    id: row.id,
    title: row.title,
    due_at: row.dueAt,
    delivered_at: row.deliveredAt,
    kind: row.kind,
  };
}
@Injectable()
export class LocalNotificationInbox extends NotificationInbox {
  private readonly storage = inject(BrowserStorage);
  load(): readonly LocalNotification[] {
    return this.storage.read(
      'notification-inbox',
      (v) => asArray(v).map(toDomain),
      () => [],
    );
  }
  save(rows: readonly LocalNotification[]): void {
    this.storage.write('notification-inbox', rows.map(toDto));
  }
}
