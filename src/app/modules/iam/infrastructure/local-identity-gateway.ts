import { Injectable } from '@angular/core';
import { IdentityGateway } from '../application/identity.service';
import { IdentityAvailability } from '../domain/model/identity-availability';
import { UserAccount } from '../domain/model/user-account.entity';
import { RegistrationDraft } from '../domain/model/registration';
import { ProfileAssembler } from './profile-assembler';
const DEMO_ACCOUNT: UserAccount = {
  id: 'pulsepower-demo',
  email: 'pulsepower@gmail.com',
  status: 'Active',
};
interface LocalAccount {
  account: UserAccount;
  name: string;
  salt: string;
  verifier: string;
  draft: RegistrationDraft | null;
}
const KEY = 'pulsepower.local.accounts';
@Injectable()
export class LocalIdentityGateway extends IdentityGateway {
  private accounts(): LocalAccount[] {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]') as LocalAccount[];
  }
  private async verifier(password: string, salt: string): Promise<string> {
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(password),
      'PBKDF2',
      false,
      ['deriveBits'],
    );
    const bytes = await crypto.subtle.deriveBits(
      { name: 'PBKDF2', salt: new TextEncoder().encode(salt), iterations: 100000, hash: 'SHA-256' },
      key,
      256,
    );
    return Array.from(new Uint8Array(bytes), (b) => b.toString(16).padStart(2, '0')).join('');
  }
  async status(): Promise<IdentityAvailability> {
    const id = sessionStorage.getItem('pulsepower.demo.account');
    return {
      onlineAccountsAvailable: false,
      currentAccount:
        id === DEMO_ACCOUNT.id
          ? DEMO_ACCOUNT
          : id
            ? (this.accounts().find((r) => r.account.id === id)?.account ?? null)
            : null,
    };
  }
  async signIn(email: string, password: string): Promise<UserAccount | null> {
    const normalized = email.trim().toLowerCase();
    if (normalized === DEMO_ACCOUNT.email) {
      if (password !== '123456') return null;
      sessionStorage.setItem('pulsepower.demo.account', DEMO_ACCOUNT.id);
      return DEMO_ACCOUNT;
    }
    const row = this.accounts().find((r) => r.account.email === normalized);
    if (!row || (await this.verifier(password, row.salt)) !== row.verifier) return null;
    sessionStorage.setItem('pulsepower.demo.account', row.account.id);
    return row.account;
  }
  async register(name: string, email: string, password: string): Promise<RegistrationDraft> {
    const rows = this.accounts();
    if (email === DEMO_ACCOUNT.email || rows.some((r) => r.account.email === email))
      throw Error('This email already has a local account. Sign in to continue.');
    const id = crypto.randomUUID(),
      salt = crypto.randomUUID();
    const draft: RegistrationDraft = { accountId: id, fullName: name, focus: 'Athlete', goal: '' };
    const row: LocalAccount = {
      account: { id, email, status: 'Active' },
      name,
      salt,
      verifier: await this.verifier(password, salt),
      draft,
    };
    localStorage.setItem(KEY, JSON.stringify([...rows, row]));
    sessionStorage.setItem('pulsepower.demo.account', id);
    return draft;
  }
  draft(): RegistrationDraft | null {
    const id = sessionStorage.getItem('pulsepower.demo.account');
    return id && id !== DEMO_ACCOUNT.id
      ? (this.accounts().find((r) => r.account.id === id)?.draft ?? null)
      : null;
  }
  saveDraft(draft: RegistrationDraft): void {
    if (sessionStorage.getItem('pulsepower.demo.account') !== draft.accountId)
      throw Error('Sign in to continue.');
    localStorage.setItem(
      KEY,
      JSON.stringify(
        this.accounts().map((r) => (r.account.id === draft.accountId ? { ...r, draft } : r)),
      ),
    );
  }
  async complete(draft: RegistrationDraft): Promise<UserAccount> {
    if (sessionStorage.getItem('pulsepower.demo.account') !== draft.accountId)
      throw Error('Sign in to continue.');
    const rows = this.accounts(),
      row = rows.find((r) => r.account.id === draft.accountId);
    if (!row) throw Error('Sign in to continue.');
    const profile = ProfileAssembler.toDto({
      displayName: draft.fullName,
      focus: draft.focus,
      age: null,
      weightKg: null,
      heightCm: null,
      mainSport: '',
      goals: [{ id: crypto.randomUUID(), description: draft.goal, completed: false }],
    });
    localStorage.setItem(
      'pulsepower.user.' + draft.accountId + '.profile',
      JSON.stringify(profile),
    );
    localStorage.setItem(
      KEY,
      JSON.stringify(rows.map((r) => (r === row ? { ...r, draft: null } : r))),
    );
    return row.account;
  }
  async deleteCurrent(): Promise<void> {
    const demo = localStorage.getItem('pulsepower.workspace') !== 'personal';
    const id = localStorage.getItem('pulsepower.account');
    const prefix = demo
      ? 'pulsepower.demo.v1.'
      : id && id !== DEMO_ACCOUNT.id
        ? 'pulsepower.user.' + id + '.'
        : 'pulsepower.v1.';
    const keys = Object.keys(localStorage).filter((key) => key.startsWith(prefix));
    keys.forEach((key) => localStorage.removeItem(key));
    if (!demo && id)
      localStorage.setItem(KEY, JSON.stringify(this.accounts().filter((r) => r.account.id !== id)));
    sessionStorage.removeItem('pulsepower.demo.account');
    localStorage.setItem('pulsepower.workspace', 'personal');
  }
  signOut(): void {
    sessionStorage.removeItem('pulsepower.demo.account');
  }
}
