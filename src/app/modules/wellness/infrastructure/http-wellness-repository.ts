import {Injectable,inject} from '@angular/core';
import {Api,ids,reconcile} from '../../../shared/infrastructure/api';
import {WellnessRepository} from '../application/ports/wellness-repository';
import {WellnessData} from '../domain/model/wellness-data';
@Injectable() export class HttpWellnessRepository extends WellnessRepository {private api=inject(Api);async load():Promise<WellnessData>{const [checkIns,habits,logs]=await Promise.all([this.api.get('/wellness/check-ins'),this.api.get('/wellness/habits'),this.api.get('/wellness/habits/logs')]);return ids({checkIns,habits,logs});}
 async save(data:WellnessData){const old=await this.load();for(const row of data.checkIns){const prev=old.checkIns.find(x=>x.date===row.date);if(JSON.stringify(prev)!==JSON.stringify(row))await this.api.post('/wellness/check-ins',row);}await reconcile(this.api,'/wellness/habits',old.habits,data.habits);for(const row of [...old.logs,...data.logs]){const a=old.logs.some(x=>x.habitId===row.habitId&&x.date===row.date),b=data.logs.some(x=>x.habitId===row.habitId&&x.date===row.date);if(a!==b)await this.api.post('/wellness/habits/'+row.habitId+'/logs',{date:row.date});}}}
