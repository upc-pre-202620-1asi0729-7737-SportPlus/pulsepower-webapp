import { Injectable, computed, inject, signal } from '@angular/core';
import { IdentityService } from '../../modules/iam/application/identity.service';
@Injectable({ providedIn: 'root' })
export class LegalNavigation {
  private readonly identity = inject(IdentityService);
  readonly ready = signal(false);
  readonly error = signal(false);
  readonly destination = computed(() =>
    this.identity.availability().currentAccount ? '/home' : '/sign-in',
  );
  async initialize(): Promise<void> {
    this.ready.set(false);
    this.error.set(false);
    try {
      await this.identity.load();
    } catch {
      this.error.set(true);
    } finally {
      this.ready.set(true);
    }
  }
}
