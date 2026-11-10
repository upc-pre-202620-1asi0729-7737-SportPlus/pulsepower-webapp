import { Injectable } from '@angular/core';

const PERSONAL_PREFIX = 'pulsepower.v1.';

@Injectable({ providedIn: 'root' })
export class BrowserStorage {
  readonly isDemo = localStorage.getItem('pulsepower.workspace') !== 'personal';
  private readonly accountId = localStorage.getItem('pulsepower.account');
  private readonly prefix = this.isDemo
    ? 'pulsepower.demo.v1.'
    : this.accountId && this.accountId !== 'pulsepower-demo'
      ? 'pulsepower.user.' + this.accountId + '.'
      : PERSONAL_PREFIX;
  seed(key: string, value: unknown): void {
    if (this.isDemo && localStorage.getItem(this.prefix + key) === null) this.write(key, value);
  }
  read<T>(key: string, decode: (data: unknown) => T, fallback: () => T): T {
    const raw = localStorage.getItem(this.prefix + key);
    if (raw === null) return fallback();
    try {
      return decode(JSON.parse(raw) as unknown);
    } catch {
      throw new Error('Saved data could not be read. Your records have been preserved.');
    }
  }
  write(key: string, value: unknown): void {
    try {
      localStorage.setItem(this.prefix + key, JSON.stringify(value));
    } catch {
      throw new Error(
        'Your browser could not save this change. Check storage permissions and available space.',
      );
    }
  }
}
export function asRecord(data: unknown): Record<string, unknown> {
  if (!data || typeof data !== 'object' || Array.isArray(data))
    throw new Error('Invalid saved object.');
  return data as Record<string, unknown>;
}
export function asArray(data: unknown): unknown[] {
  if (!Array.isArray(data)) throw new Error('Invalid saved collection.');
  return data;
}
export function textField(data: Record<string, unknown>, key: string): string {
  const value = data[key];
  if (typeof value !== 'string') throw new Error('Invalid saved text.');
  return value;
}
export function numberField(data: Record<string, unknown>, key: string): number {
  const value = data[key];
  if (typeof value !== 'number' || !Number.isFinite(value))
    throw new Error('Invalid saved number.');
  return value;
}
