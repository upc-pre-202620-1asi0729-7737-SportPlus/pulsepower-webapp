import { describe, expect, it } from 'vitest';
import { chartSegments } from './chart-series';
describe('Chart series', () => {
  it('keeps missing days as gaps and preserves recorded zero values', () => {
    const segments = chartSegments({
      label: 'Sleep',
      color: '#000',
      unit: 'h',
      points: [
        { label: 'Mon', value: 8 },
        { label: 'Tue', value: null },
        { label: 'Wed', value: 0 },
      ],
    });
    expect(segments).toHaveLength(2);
    expect(segments[1]!.points[0]!.value).toBe(0);
    expect(segments[1]!.points[0]!.y).toBe(208);
  });
  it('normalizes geometry without changing values shown in the data table', () => {
    const segments = chartSegments(
      {
        label: 'Training',
        color: '#000',
        unit: 'min',
        points: [
          { label: 'Mon', value: 30 },
          { label: 'Tue', value: 60 },
        ],
      },
      true,
    );
    expect(segments[0]!.points.map((p) => p.y)).toEqual([118, 28]);
    expect(segments[0]!.points.map((p) => p.value)).toEqual([30, 60]);
  });
});
