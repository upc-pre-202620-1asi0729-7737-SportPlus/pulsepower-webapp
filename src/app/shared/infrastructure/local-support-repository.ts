import { Injectable, inject } from '@angular/core';
import { SupportRepository, SupportTicket } from '../application/ports/support-repository';
import { BrowserStorage, asArray, asRecord, textField } from './browser-storage';
interface SupportTicketDto {
  reference: string;
  description: string;
  created_at: string;
}
function toDomain(value: unknown): SupportTicket {
  const row = asRecord(value);
  return {
    reference: textField(row, 'reference'),
    description: textField(row, 'description'),
    createdAt: textField(row, 'created_at'),
  };
}
function toDto(row: SupportTicket): SupportTicketDto {
  return { reference: row.reference, description: row.description, created_at: row.createdAt };
}
@Injectable()
export class LocalSupportRepository extends SupportRepository {
  private readonly storage = inject(BrowserStorage);
  list(): readonly SupportTicket[] {
    return this.storage.read(
      'support-tickets',
      (v) => asArray(v).map(toDomain),
      () => [],
    );
  }
  save(ticket: SupportTicket): void {
    this.storage.write('support-tickets', [ticket, ...this.list()].map(toDto));
  }
}
