import '@angular/compiler';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { LocalIdentityGateway } from './local-identity-gateway';
describe('Prepared demo account', () => {
  afterEach(() => vi.unstubAllGlobals());
  it('accepts the demo credentials and stores only the demo account identifier', async () => {
    const data = new Map<string, string>();
    vi.stubGlobal('sessionStorage', {
      getItem: (key: string) => data.get(key) ?? null,
      setItem: (key: string, value: string) => data.set(key, value),
    });
    const gateway = new LocalIdentityGateway();
    expect((await gateway.signIn(' PulsePower@gmail.com ', '123456'))?.email).toBe(
      'pulsepower@gmail.com',
    );
    expect([...data.values()]).toEqual(['pulsepower-demo']);
    expect((await gateway.status()).currentAccount?.id).toBe('pulsepower-demo');
    expect((await gateway.status()).onlineAccountsAvailable).toBe(false);
  });
  it('rejects an incorrect email or password without writing a session', async () => {
    vi.stubGlobal('localStorage', { getItem: () => null });
    const setItem = vi.fn();
    vi.stubGlobal('sessionStorage', { setItem });
    const gateway = new LocalIdentityGateway();
    expect(await gateway.signIn('other@example.com', '123456')).toBeNull();
    expect(await gateway.signIn('pulsepower@gmail.com', 'wrong')).toBeNull();
    expect(setItem).not.toHaveBeenCalled();
  });
});
