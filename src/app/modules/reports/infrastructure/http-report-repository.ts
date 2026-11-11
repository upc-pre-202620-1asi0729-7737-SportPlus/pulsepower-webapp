import {Injectable,inject} from '@angular/core';
import {Api,ids} from '../../../shared/infrastructure/api';
import {ReportRepository} from '../application/ports/report-ports';
import {ProgressReport} from '../domain/model/progress-report.entity';
@Injectable() export class HttpReportRepository extends ReportRepository {
private api=inject(Api);async list():Promise<readonly ProgressReport[]>{return ids(await this.api.get('/reports')).map((r:any)=>({...r,status:'Completed',documentRef:r.id,types:r.types.map((t:string)=>t.charAt(0).toUpperCase()+t.slice(1))}));}
async save(r:ProgressReport,bytes:Uint8Array){let binary='';for(const b of bytes)binary+=String.fromCharCode(b);await this.api.post('/reports',{from:r.from,to:r.to,types:r.types,note:'',documentBase64:btoa(binary)});}
async document(id:string){const r=await this.api.get('/reports/'+id+'/document');return Uint8Array.from(atob(r.documentBase64),c=>c.charCodeAt(0));}}
