import { RecoverySimulationStore } from '../../modules/physiology/application/recovery-simulation.store';
import { WorkspaceMode } from './workspace-mode';
import { Injectable, inject } from '@angular/core';
import { ReportSource } from '../../modules/reports/application/ports/report-ports';
import { ReportEntry } from '../../modules/reports/application/reporting.store';
import { TrainingStore } from '../../modules/training/application/training.store';
import { SleepStore } from '../../modules/sleep/application/sleep.store';
import { WellnessStore } from '../../modules/wellness/application/wellness.store';
import { localDate } from './calendar';
import { I18n } from './i18n';
@Injectable()
export class WorkspaceReportSource extends ReportSource {
  private readonly recovery = inject(RecoverySimulationStore);
  private readonly workspace = inject(WorkspaceMode);
  private readonly i18n = inject(I18n);
  private readonly training = inject(TrainingStore);
  private readonly sleep = inject(SleepStore);
  private readonly wellness = inject(WellnessStore);
  async entries(): Promise<readonly ReportEntry[]> {
    const results = await Promise.all([
      this.training.load(),
      this.sleep.load(),
      this.wellness.load(),
    ]);
    if (results.some((result) => !result))
      throw new Error(
        'Some records could not be loaded. Please retry after the current operation completes.',
      );
    if (this.workspace.mode === 'demo') await this.recovery.load();
    return [
      ...(this.workspace.mode === 'demo'
        ? this.recovery
            .rows()
            .filter((row) => row.score !== null)
            .map((row) => ({
              date: row.date,
              type: 'Recovery' as const,
              summary: this.i18n.text('Recovery simulation') + ': ' + row.score + '%',
            }))
        : []),
      ...this.training.sessions().map((row) => ({
        date: row.date,
        type: 'Training' as const,
        summary:
          row.activity +
          ' - ' +
          row.durationMinutes +
          ' min; ' +
          this.i18n.text('Perceived effort') +
          ' ' +
          row.perceivedEffort +
          '/10. ' +
          row.notes,
      })),
      ...this.sleep.records().map((row) => ({
        date: localDate(new Date(row.endedAt)),
        type: 'Sleep' as const,
        summary:
          this.sleep.recordDuration(row.startedAt, row.endedAt) +
          '; ' +
          row.source +
          '. ' +
          row.notes,
      })),
      ...this.wellness.checkIns().map((row) => ({
        date: row.date,
        type: 'Wellness' as const,
        summary:
          this.i18n.text('Overall state') +
          ' ' +
          row.mood +
          '/5; ' +
          this.i18n.text('Stress') +
          ' ' +
          row.stress +
          '/10; ' +
          this.i18n.text('Discomfort') +
          ' ' +
          this.i18n.text(row.discomfort ? 'Reported' : 'Not reported') +
          '. ' +
          row.notes,
      })),
    ].sort((a, b) => a.date.localeCompare(b.date));
  }
}
