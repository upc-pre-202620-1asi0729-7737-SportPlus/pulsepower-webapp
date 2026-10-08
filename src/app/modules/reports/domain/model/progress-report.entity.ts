import { ReportType } from './report-type';

export interface ProgressReport {
  readonly id: string;
  readonly from: string;
  readonly to: string;
  readonly types: readonly ReportType[];
  readonly requestedAt: string;
  readonly status: 'Completed';
  readonly fileName: string;
  readonly documentRef: string;
}
