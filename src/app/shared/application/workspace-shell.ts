import { Injectable, inject } from '@angular/core';
import { ShellState } from './shell-state';
import { ProfileStore } from '../../modules/iam/application/profile.store';
@Injectable()
export class WorkspaceShell extends ShellState {
  private readonly profile = inject(ProfileStore);
  readonly name = this.profile.name;
  readonly initials = this.profile.initials;
  async initialize(): Promise<void> {
    await this.profile.load();
  }
}
