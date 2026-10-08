import { UserProfile } from '../../domain/model/user-profile.entity';
export abstract class ProfileRepository {
  abstract load(): Promise<UserProfile | null>;
  abstract save(profile: UserProfile): Promise<void>;
}
