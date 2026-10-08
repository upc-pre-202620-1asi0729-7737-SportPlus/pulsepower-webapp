export interface SupportTicket {
  readonly reference: string;
  readonly description: string;
  readonly createdAt: string;
}
export abstract class SupportRepository {
  abstract list(): readonly SupportTicket[];
  abstract save(ticket: SupportTicket): void;
}
