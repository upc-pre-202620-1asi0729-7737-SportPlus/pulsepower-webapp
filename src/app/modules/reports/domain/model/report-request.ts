import { ReportType, REPORT_TYPES } from './report-type';
import { ReportEntry } from './report-entry';
import { requireDate, DomainError, requireChoice } from '../../../../shared/domain/validation';

export interface ReportRequest {
  readonly from: string;
  readonly to: string;
  readonly types: readonly ReportType[];
  readonly note: string;
}

export function validateReport(
  request: ReportRequest,
  entries: readonly ReportEntry[],
): readonly ReportEntry[] {
  requireDate(request.from);
  requireDate(request.to);
  if (request.from > request.to)
    throw new DomainError('The end date must be on or after the start date.');
  if (!request.types.length) throw new DomainError('Choose at least one category for your report.');
  request.types.forEach((type) => requireChoice(type, REPORT_TYPES, 'report category'));
  const history = entries
    .filter((entry) => request.types.includes(entry.type) && entry.date <= request.to)
    .map((entry) => entry.date)
    .sort();
  if (
    !history.length ||
    (Date.parse(history[history.length - 1]!) - Date.parse(history[0]!)) / 86400000 < 6
  ) {
    if (history.length) {
      const earliest = new Date(history[0]! + 'T12:00:00Z');
      earliest.setUTCDate(earliest.getUTCDate() + 6);
      throw new DomainError(
        'Earliest report date: ' +
          earliest.toISOString().slice(0, 10) +
          '. Continue recording data to complete a week.',
      );
    }
    throw new DomainError(
      'Reports require at least one week of recorded history. Add earlier records or return after your first week.',
    );
  }
  for (const type of request.types) {
    const dates = entries
      .filter((entry) => entry.type === type && entry.date <= request.to)
      .map((entry) => entry.date)
      .sort();
    if (
      !dates.length ||
      (Date.parse(dates[dates.length - 1]!) - Date.parse(dates[0]!)) / 86400000 < 6
    )
      throw new DomainError(
        'Each selected category needs a week of history. Uncheck categories without enough records.',
      );
  }
  const selected = entries.filter(
    (entry) =>
      request.types.includes(entry.type) && entry.date >= request.from && entry.date <= request.to,
  );
  if (!selected.length) throw new DomainError('There are no records in the selected period.');
  return selected;
}
