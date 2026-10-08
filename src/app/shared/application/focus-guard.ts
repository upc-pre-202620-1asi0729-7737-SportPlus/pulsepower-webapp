import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ProfileStore } from '../../modules/iam/application/profile.store';
import { UserProfile } from '../../modules/iam/domain/model/user-profile.entity';

/**
 * Restricts a route to accounts whose profile focus matches the given value.
 * Accounts with the other focus (or no profile yet) are redirected to /home.
 * Used to separate the Athlete-oriented modules (training, planning, recovery)
 * from the Wellness Seeker-oriented ones (sleep, wellness).
 */
export function requireFocus(focus: UserProfile['focus']): CanActivateFn {
  return async () => {
    const profileStore = inject(ProfileStore);
    const router = inject(Router);
    if (!profileStore.profile()) await profileStore.load();
    const profile = profileStore.profile();
    if (!profile || profile.focus === focus) return true;
    return router.parseUrl('/home');
  };
}
