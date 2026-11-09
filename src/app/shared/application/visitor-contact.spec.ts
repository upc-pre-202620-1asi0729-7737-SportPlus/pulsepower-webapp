import '@angular/compiler';
import { createEnvironmentInjector, runInInjectionContext } from '@angular/core';
import { describe, expect, it } from 'vitest';
import { Clock } from './clock';
import { VisitorContact } from './visitor-contact';
function form(): VisitorContact {
  const injector = createEnvironmentInjector(
    [{ provide: Clock, useValue: { id: () => 'fixed-id' } }],
    null as never,
  );
  return runInInjectionContext(injector, () => new VisitorContact());
}
describe('VisitorContact', () => {
  it('rejects an invalid email without creating a reference', async () => {
    const contact = form();
    expect(await contact.send('not-an-email', 'Hello')).toBe(false);
    expect(contact.error()).toBe('help.public.form.invalidEmail');
    expect(contact.reference()).toBeNull();
  });
  it('rejects an empty message with a translatable label', async () => {
    const contact = form();
    expect(await contact.send('visitor@example.com', '   ')).toBe(false);
    expect(contact.error()).toBe('Message must contain 1–2000 characters.');
  });
  it('simulates a valid message without sending it anywhere', async () => {
    const contact = form();
    expect(await contact.send(' visitor@example.com ', 'How do plans work?')).toBe(true);
    expect(contact.reference()).toBe('DEMO-fixed-id');
    expect(contact.message()).toBe('help.public.form.sent');
  });
});
