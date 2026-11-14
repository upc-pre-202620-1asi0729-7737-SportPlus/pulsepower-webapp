import { inject } from '@angular/core';
import { CanActivateFn, CanMatchFn, Router } from '@angular/router';
import { IdentityService } from '../../modules/iam/application/identity.service';

async function hasSession(identity: IdentityService): Promise<boolean> {
  try {
    await identity.load();
  } catch {
    return false;
  }
  return identity.availability().currentAccount !== null;
}

/**
 * Keeps the workspace behind a session. Visitors without one are sent to the
 * sign-in page instead of reaching the authenticated layout.
 */
export const requireSession: CanActivateFn = async () => {
  const identity = inject(IdentityService);
  const router = inject(Router);
  return (await hasSession(identity)) || router.parseUrl('/sign-in');
};

/**
 * Matches a route only for visitors without a session. When a session exists
 * the router falls through to the next route with the same path.
 */
export const withoutSession: CanMatchFn = async () => !(await hasSession(inject(IdentityService)));
