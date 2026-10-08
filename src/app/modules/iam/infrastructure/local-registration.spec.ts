import '@angular/compiler';
import { beforeEach, afterEach, expect, it, vi } from 'vitest';
import { LocalIdentityGateway } from './local-identity-gateway';
import { BrowserStorage } from '../../../shared/infrastructure/browser-storage';
function storage(): Storage {
  const values: Record<string, string> = {};
  return Object.defineProperties(values, {
    getItem: { value: (key: string) => values[key] ?? null },
    setItem: {
      value: (key: string, value: string) => {
        values[key] = value;
      },
    },
    removeItem: {
      value: (key: string) => {
        delete values[key];
      },
    },
    clear: { value: () => Object.keys(values).forEach((key) => delete values[key]) },
    key: { value: (index: number) => Object.keys(values)[index] ?? null },
    length: { get: () => Object.keys(values).length },
  }) as unknown as Storage;
}
beforeEach(() => {
  vi.stubGlobal('localStorage', storage());
  vi.stubGlobal('sessionStorage', storage());
});
afterEach(() => vi.unstubAllGlobals());
it('resumes onboarding, signs in again and rejects duplicate emails without storing passwords', async () => {
  const gateway = new LocalIdentityGateway();
  const draft = await gateway.register('Alex', 'alex@example.com', 'example123');
  gateway.saveDraft({ ...draft, focus: 'Wellness Seeker', goal: 'Sleep regularly' });
  expect(new LocalIdentityGateway().draft()?.goal).toBe('Sleep regularly');
  const account = await gateway.complete(gateway.draft()!);
  expect(gateway.draft()).toBeNull();
  sessionStorage.clear();
  expect(await gateway.signIn('alex@example.com', 'wrong')).toBeNull();
  expect((await gateway.signIn(' ALEX@example.com ', 'example123'))?.id).toBe(account.id);
  expect(localStorage.getItem('pulsepower.local.accounts')).not.toContain('example123');
  await expect(gateway.register('Other', 'alex@example.com', 'other123')).rejects.toThrow();
});
it('keeps two local accounts isolated and deletes only the selected account', async () => {
  const gateway = new LocalIdentityGateway();
  const first = await gateway.register('One', 'one@example.com', 'password1');
  await gateway.complete({ ...first, goal: 'First goal' });
  const second = await gateway.register('Two', 'two@example.com', 'password2');
  await gateway.complete({ ...second, goal: 'Second goal' });
  localStorage.setItem('pulsepower.workspace', 'personal');
  localStorage.setItem('pulsepower.account', first.accountId);
  new BrowserStorage().write('test-record', { value: 1 });
  localStorage.setItem('pulsepower.account', second.accountId);
  expect(
    new BrowserStorage().read(
      'test-record',
      (v) => v,
      () => null,
    ),
  ).toBeNull();
  await gateway.deleteCurrent();
  expect(localStorage.getItem('pulsepower.user.' + first.accountId + '.test-record')).toContain(
    '1',
  );
  expect(localStorage.getItem('pulsepower.user.' + second.accountId + '.profile')).toBeNull();
  expect(await gateway.signIn('two@example.com', 'password2')).toBeNull();
  expect(await gateway.signIn('one@example.com', 'password1')).not.toBeNull();
});
