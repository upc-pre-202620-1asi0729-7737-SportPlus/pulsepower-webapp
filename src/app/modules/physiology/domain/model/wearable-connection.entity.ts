export interface WearableConnection {
  readonly id: string;
  readonly provider: string;
  readonly status: 'Connected' | 'Disconnected' | 'Pending';
  readonly lastSyncedAt: string | null;
}
