import { ReportType } from './report-type';

export interface ReportEntry {
  readonly date: string;
  readonly type: ReportType;
  readonly summary: string;
}
