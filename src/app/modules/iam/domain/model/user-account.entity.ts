export interface UserAccount {
  readonly id: string;
  readonly email: string;
  readonly status: 'Active' | 'Disabled';
}
