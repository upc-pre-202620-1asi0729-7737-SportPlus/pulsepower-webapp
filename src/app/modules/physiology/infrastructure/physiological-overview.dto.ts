export interface PhysiologicalOverviewDto {
  integration_available: boolean;
  connection: {
    id: string;
    provider: string;
    status: 'Connected' | 'Disconnected' | 'Pending';
    last_synced_at: string | null;
  } | null;
  records: {
    id: string;
    metric: 'HRV' | 'RESTING_HR' | 'HEART_RATE' | 'STRAIN';
    value: number;
    unit: string;
    recorded_at: string;
  }[];
  recovery: { id: string; level: number; calculated_at: string; explanation: string } | null;
  recommendations: { id: string; title: string; explanation: string; suggested_action: string }[];
  alerts: {
    id: string;
    title: string;
    message: string;
    issued_at: string;
    reviewed_at: string | null;
  }[];
}
