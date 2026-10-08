import { requireChoice, requireText, DomainError } from '../../../../shared/domain/validation';
export interface RegistrationDraft {
  readonly accountId: string;
  readonly fullName: string;
  readonly focus: 'Athlete' | 'Wellness Seeker';
  readonly goal: string;
}
export function registrationCredentials(
  name: string,
  email: string,
  password: string,
  confirmation: string,
) {
  const fullName = requireText(name, 'Full name', 100);
  const normalizedEmail = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail))
    throw new DomainError('Enter a valid email address.');
  if (password.length < 8) throw new DomainError('Use at least 8 characters.');
  if (password !== confirmation) throw new DomainError('auth.passwordMismatch');
  return { fullName, email: normalizedEmail };
}
export function registrationFocus(draft: RegistrationDraft): RegistrationDraft {
  return {
    ...draft,
    focus: requireChoice(draft.focus, ['Athlete', 'Wellness Seeker'], 'focus'),
    goal: requireText(draft.goal, 'Goal', 200),
  };
}
