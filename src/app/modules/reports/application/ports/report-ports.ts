import { ProgressReport } from '../../domain/model/progress-report.entity';
import { ReportEntry } from '../../domain/model/report-entry';
import { ReportRequest } from '../../domain/model/report-request';
export abstract class ReportSource {
  abstract entries(): Promise<readonly ReportEntry[]>;
}
export abstract class ReportDocument {
  abstract create(request: ReportRequest, entries: readonly ReportEntry[]): Promise<Uint8Array>;
  abstract download(bytes: Uint8Array, fileName: string): void;
}
export abstract class ReportRepository {
  abstract list(): Promise<readonly ProgressReport[]>;
  abstract save(report: ProgressReport, bytes: Uint8Array): Promise<void>;
  abstract document(id: string): Promise<Uint8Array>;
}
