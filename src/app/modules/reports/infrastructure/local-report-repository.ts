import { Injectable, inject } from '@angular/core';
import { asArray, BrowserStorage } from '../../../shared/infrastructure/browser-storage';
import { ReportRepository } from '../application/ports/report-ports';
import { ProgressReport } from '../domain/model/progress-report.entity';
import { ProgressReportDto } from './progress-report.dto';
import { ReportAssembler } from './report-assembler';
@Injectable()
export class LocalReportRepository extends ReportRepository {
  private readonly storage = inject(BrowserStorage);
  private records(): ProgressReportDto[] {
    return this.storage.read(
      'reports',
      (value) => asArray(value).map(ReportAssembler.decode),
      () => [],
    );
  }
  async list(): Promise<readonly ProgressReport[]> {
    return this.records().map(ReportAssembler.toDomain);
  }
  async save(report: ProgressReport, bytes: Uint8Array): Promise<void> {
    let binary = '';
    for (const byte of bytes) binary += String.fromCharCode(byte);
    const dto: ProgressReportDto = {
      id: report.id,
      from: report.from,
      to: report.to,
      types: [...report.types],
      requested_at: report.requestedAt,
      file_name: report.fileName,
      document_base64: btoa(binary),
    };
    this.storage.write('reports', [dto, ...this.records()]);
  }
  async document(id: string): Promise<Uint8Array> {
    const report = this.records().find((row) => row.id === id);
    if (!report) throw new Error('The report is no longer available.');
    return Uint8Array.from(atob(report.document_base64), (character) => character.charCodeAt(0));
  }
}
