export class DomainError extends Error {}
export function optionalText(value: string, label: string, max = 2000): string {
  const normalized = value.trim();
  if (normalized.length > max) throw new DomainError(`${label} cannot exceed ${max} characters.`);
  return normalized;
}
export function requireText(value: string, label: string, max = 200): string {
  const normalized = value.trim();
  if (!normalized || normalized.length > max)
    throw new DomainError(`${label} must contain 1–${max} characters.`);
  return normalized;
}
export function requireNumber(value: number, label: string, min: number, max: number): number {
  if (!Number.isFinite(value) || value < min || value > max)
    throw new DomainError(`${label} must be between ${min} and ${max}.`);
  return value;
}
export function requireDate(value: string): string {
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
    !Number.isFinite(Date.parse(value)) ||
    new Date(value + 'T12:00:00Z').toISOString().slice(0, 10) !== value
  )
    throw new DomainError('Choose a valid date.');
  return value;
}
export function requireChoice<T extends string>(
  value: string,
  choices: readonly T[],
  label: string,
): T {
  const selected = choices.find((choice) => choice === value);
  if (!selected) throw new DomainError(`Choose a valid ${label}.`);
  return selected;
}
