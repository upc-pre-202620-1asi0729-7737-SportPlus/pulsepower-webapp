export const REPORT_TYPES = ['Training', 'Sleep', 'Wellness', 'Recovery'] as const;

export type ReportType = (typeof REPORT_TYPES)[number];
