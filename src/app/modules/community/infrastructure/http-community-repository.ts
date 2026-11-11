import {Injectable,inject} from '@angular/core';
import {Api,ids} from '../../../shared/infrastructure/api';
import {CommunityRepository} from '../application/ports/community-ports';
import {SharedProgress} from '../domain/model/shared-progress.entity';
@Injectable() export class HttpCommunityRepository extends CommunityRepository {
private api=inject(Api);async list():Promise<readonly SharedProgress[]>{return ids(await this.api.get('/community/progress'));}
async save(p:SharedProgress){await this.api.post('/community/progress',{title:p.title,content:p.content});}
async remove(id:string){await this.api.del('/community/progress/'+id);}
async shares():Promise<Readonly<Record<string,readonly ('group'|'contact')[]>>>{const rows=await this.api.get('/community/progress');return Object.fromEntries(rows.map((r:any)=>[String(r.id),r.audiences.map((a:string)=>a.toLowerCase())]));}
async saveShares(value:Readonly<Record<string,readonly ('group'|'contact')[]>>){const old=await this.shares();for(const id of new Set([...Object.keys(old),...Object.keys(value)])){for(const a of value[id]??[])if(!old[id]?.includes(a))await this.api.post('/community/progress/'+id+'/shares',{audience:a});for(const a of old[id]??[])if(!value[id]?.includes(a))await this.api.del('/community/progress/'+id+'/shares/'+a);}}
async achievements(){const rows=await this.api.get('/community/achievements');return {catalog:rows.map((r:any)=>({id:String(r.id),name:r.name,description:r.description})),earned:rows.filter((r:any)=>r.earnedAt).map((r:any)=>({achievementId:String(r.id),earnedAt:r.earnedAt}))};}}
