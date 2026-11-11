import {Injectable,inject} from '@angular/core';
import {Api,ids,reconcile} from '../../../shared/infrastructure/api';
import {ProfileRepository} from '../application/ports/profile-repository';
import {UserProfile} from '../domain/model/user-profile.entity';
@Injectable() export class HttpProfileRepository extends ProfileRepository {
private api=inject(Api);async load():Promise<UserProfile>{return ids(await this.api.get('/users/me'));}
async save(p:UserProfile){const old=await this.load();await this.api.put('/users/me/profile',p);await reconcile(this.api,'/users/me/goals',old.goals,p.goals,r=>this.api.put('/users/me/goals/'+r.id,{completed:r.completed}));}}
