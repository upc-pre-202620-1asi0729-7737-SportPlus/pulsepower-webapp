import { Injectable, inject } from '@angular/core';
import { BrowserStorage } from '../../../../../../../../../../../Downloads/pulsepower-webapp/src/app/shared/infrastructure/browser-storage';
import { ProfileRepository } from '../application/ports/profile-repository';
import { UserProfile } from '../domain/model/user-profile.entity';
import { ProfileAssembler } from './profile-assembler';
@Injectable()
export class LocalProfileRepository extends ProfileRepository {
  private readonly storage = inject(BrowserStorage);
  async load(): Promise<UserProfile | null> {
    return this.storage.read<UserProfile | null>('profile', ProfileAssembler.toDomain, () => null);
  }
  async save(profile: UserProfile): Promise<void> {
    await this.load();
    this.storage.write('profile', ProfileAssembler.toDto(profile));
  }
}
