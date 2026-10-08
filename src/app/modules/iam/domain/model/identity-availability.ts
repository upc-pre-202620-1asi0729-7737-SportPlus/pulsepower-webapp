import { UserAccount } from './user-account.entity';

export interface IdentityAvailability {
  readonly onlineAccountsAvailable: boolean;
  readonly currentAccount: UserAccount | null;
}
