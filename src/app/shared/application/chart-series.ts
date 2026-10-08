import { ChartPoint } from './chart-point';

export interface ChartSeries {
  readonly label: string;
  readonly color: string;
  readonly points: readonly ChartPoint[];
  readonly unit: string;
  readonly maximum?: number;
}

export interface ChartSegment {
  readonly points: readonly {
    readonly x: number;
    readonly y: number;
    readonly value: number;
    readonly label: string;
  }[];
  readonly line: string;
  readonly area: string;
}

export function chartSegments(series: ChartSeries, normalized = false): readonly ChartSegment[] {
  const maximum = series.maximum ?? Math.max(1, ...series.points.map((p) => p.value ?? 0));
  const groups: { x: number; y: number; value: number; label: string }[][] = [];
  let current: (typeof groups)[number] = [];
  series.points.forEach((point, index) => {
    if (point.value === null) {
      if (current.length) groups.push(current);
      current = [];
      return;
    }
    const x = 36 + (index * 628) / Math.max(1, series.points.length - 1);
    const scale = normalized ? Math.max(1, ...series.points.map((p) => p.value ?? 0)) : maximum;
    current.push({
      x,
      y: 208 - Math.min(1, Math.max(0, point.value / scale)) * 180,
      value: point.value,
      label: point.label,
    });
  });
  if (current.length) groups.push(current);
  return groups.map((points) => ({
    points,
    line: points.map((p, i) => `${i ? 'L' : 'M'} ${p.x} ${p.y}`).join(' '),
    area: `M ${points[0]!.x} 208 ${points.map((p) => `L ${p.x} ${p.y}`).join(' ')} L ${points[points.length - 1]!.x} 208 Z`,
  }));
}
