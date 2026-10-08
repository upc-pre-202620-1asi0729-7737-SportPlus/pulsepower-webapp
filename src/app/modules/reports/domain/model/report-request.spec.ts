import { describe, expect, it } from 'vitest';
import { validateReport, ReportRequest } from './report-request';
const request: ReportRequest = { from: '2026-10-01', to: '2026-10-31', types: ['Sleep'], note: '' };
describe('Report availability', () => {
  it('explains the earliest date without treating future time as recorded history', () => {
    expect(() =>
      validateReport(request, [{ type: 'Sleep', date: '2026-10-01', summary: '8 hours' }]),
    ).toThrow('2026-10-07');
  });
  it('rejects an empty selected period even with sufficient earlier history', () => {
    expect(() =>
      validateReport({ ...request, from: '2026-10-15' }, [
        { type: 'Sleep', date: '2026-10-01', summary: '' },
        { type: 'Sleep', date: '2026-10-07', summary: '' },
      ]),
    ).toThrow('There are no records');
  });
});
