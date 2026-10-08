import { Injectable, inject, signal } from '@angular/core';
import { ActionState } from '../../../shared/application/action-state';
import { Clock } from '../../../shared/application/clock';
import { lastDays } from '../../../shared/application/calendar';
import { ProgressReport } from '../domain/model/progress-report.entity';
import { ReportRequest, validateReport } from '../domain/model/report-request';
import { ReportType } from '../domain/model/report-type';
import { ReportDocument, ReportRepository, ReportSource } from './ports/report-ports';
export type ReportCommand = { -readonly [K in keyof ReportRequest]: ReportRequest[K] };
export type { ReportEntry } from '../domain/model/report-entry';
export type { ReportType } from '../domain/model/report-type';
@Injectable({ providedIn: 'root' })
export class ReportingStore extends ActionState {
  private readonly source = inject(ReportSource);
  private readonly repository = inject(ReportRepository);
  private readonly document = inject(ReportDocument);
  private readonly clock = inject(Clock);
  private readonly reportState = signal<readonly ProgressReport[]>([]);
  readonly reports = this.reportState.asReadonly();
  readonly today = this.clock.today();
  readonly weekStart = lastDays(this.today)[0]!;
  readonly categories: readonly ReportType[] = ['Training', 'Sleep', 'Wellness', 'Recovery'];
  load(): Promise<boolean> {
    return this.read(async () => this.reportState.set(await this.repository.list()));
  }
  generate(command: ReportCommand): Promise<boolean> {
    return this.execute(async () => {
      const entries = validateReport(command, await this.source.entries());
      const bytes = await this.document.create(command, entries);
      const id = this.clock.id(),
        fileName = 'PulsePower-' + command.from + '-' + command.to + '.pdf';
      const report: ProgressReport = {
        id,
        from: command.from,
        to: command.to,
        types: [...command.types],
        requestedAt: this.clock.now().toISOString(),
        status: 'Completed',
        fileName,
        documentRef: id,
      };
      await this.repository.save(report, bytes);
      this.reportState.set(await this.repository.list());
      this.document.download(bytes, fileName);
    }, 'Your PDF report is ready.');
  }
  download(report: ProgressReport): Promise<boolean> {
    return this.execute(async () =>
      this.document.download(await this.repository.document(report.documentRef), report.fileName),
    );
  }
}
