import { Injectable, inject, signal } from '@angular/core';
import { IdentityAvailability } from '../domain/model/identity-availability';
import { UserAccount } from '../domain/model/user-account.entity';
import { BrowserPreferences } from '../../../../../../../../../../../Downloads/pulsepower-webapp/src/app/shared/application/ports/browser-preferences';
import {
  RegistrationDraft,
  registrationCredentials,
  registrationFocus,
} from '../domain/model/registration';
export abstract class IdentityGateway {
  abstract status(): Promise<IdentityAvailability>;
  abstract signIn(email: string, password: string): Promise<UserAccount | null>;
  abstract register(name: string, email: string, password: string): Promise<RegistrationDraft>;
  abstract draft(): RegistrationDraft | null;
  abstract saveDraft(draft: RegistrationDraft): void;
  abstract complete(draft: RegistrationDraft): Promise<UserAccount>;
  abstract deleteCurrent(): Promise<void>;
  abstract signOut(): void;
}
@Injectable({ providedIn: 'root' })
export class IdentityService {
  private readonly preferences = inject(BrowserPreferences);
  readonly signInError = signal<string | null>(null);
  readonly signingIn = signal(false);
  async signIn(email: string, password: string): Promise<boolean> {
    if (this.signingIn()) return false;
    this.signingIn.set(true);
    this.signInError.set(null);
    try {
      const account = await this.gateway.signIn(email, password);
      if (!account) {
        this.signInError.set('auth.invalidDemoCredentials');
        return false;
      }
      this.preferences.write(
        'pulsepower.workspace',
        account.id === 'pulsepower-demo' ? 'demo' : 'personal',
      );
      this.preferences.write('pulsepower.account', account.id);
      this.state.set({ onlineAccountsAvailable: false, currentAccount: account });
      return true;
    } catch {
      this.signInError.set('auth.demoSignInFailed');
      return false;
    } finally {
      this.signingIn.set(false);
    }
  }
  reloadDemo(): void {
    this.preferences.reload();
  }
  private readonly registrationFeedback = signal<string | null>(null);
  readonly registrationMessage = this.registrationFeedback.asReadonly();
  readonly registering = signal(false);
  readonly draft = signal<RegistrationDraft | null>(null);
  restoreDraft(): void {
    this.draft.set(this.gateway.draft());
  }
  async register(
    name: string,
    email: string,
    password: string,
    confirmation: string,
  ): Promise<boolean> {
    if (this.registering()) return false;
    this.registering.set(true);
    this.registrationFeedback.set(null);
    try {
      const valid = registrationCredentials(name, email, password, confirmation);
      this.draft.set(await this.gateway.register(valid.fullName, valid.email, password));
      return true;
    } catch (e) {
      this.registrationFeedback.set(e instanceof Error ? e.message : 'Registration failed.');
      return false;
    } finally {
      this.registering.set(false);
    }
  }
  saveFocus(focus: RegistrationDraft['focus'], goal: string): void {
    const draft = this.draft();
    if (!draft) return;
    try {
      const next = { ...draft, focus, goal };
      this.gateway.saveDraft(next);
      this.draft.set(next);
    } catch {
      this.registrationFeedback.set('Your browser could not save this change.');
    }
  }
  async complete(): Promise<boolean> {
    try {
      const draft = this.draft();
      if (!draft) return false;
      const account = await this.gateway.complete(registrationFocus(draft));
      this.preferences.write('pulsepower.account', account.id);
      this.preferences.write('pulsepower.workspace', 'personal');
      this.draft.set(null);
      return true;
    } catch (e) {
      this.registrationFeedback.set(e instanceof Error ? e.message : 'Registration failed.');
      return false;
    }
  }
  async deleteCurrent(): Promise<boolean> {
    try {
      await this.gateway.deleteCurrent();
      this.preferences.write('pulsepower.account', '');
      return true;
    } catch {
      this.signInError.set('Your browser could not save this change.');
      return false;
    }
  }
  resetRegistration(): void {
    this.registrationFeedback.set(null);
  }
  signOut(): void {
    this.gateway.signOut();
    this.state.set({ onlineAccountsAvailable: false, currentAccount: null });
  }
  private readonly gateway = inject(IdentityGateway);
  private readonly state = signal<IdentityAvailability>({
    onlineAccountsAvailable: false,
    currentAccount: null,
  });
  readonly availability = this.state.asReadonly();
  async load(): Promise<void> {
    this.state.set(await this.gateway.status());
  }
}
