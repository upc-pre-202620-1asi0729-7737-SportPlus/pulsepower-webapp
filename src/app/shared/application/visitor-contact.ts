import { Injectable, inject, signal } from '@angular/core';
import { ActionState } from './action-state';
import { Clock } from './clock';
import { DomainError, requireText } from '../domain/validation';

/**
 * Contact form of the public help page. It is a simulation: nothing is sent
 * and nothing is stored, so visitors only get an on-screen reference.
 */
@Injectable()
export class VisitorContact extends ActionState {
  private readonly clock = inject(Clock);
  readonly reference = signal<string | null>(null);
  send(email: string, message: string): Promise<boolean> {
    return this.execute(async () => {
      this.reference.set(null);
      const address = email.trim();
      if (address.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address))
        throw new DomainError('help.public.form.invalidEmail');
      requireText(message, 'Message', 2000);
      this.reference.set('DEMO-' + this.clock.id());
    }, 'help.public.form.sent');
  }
}
