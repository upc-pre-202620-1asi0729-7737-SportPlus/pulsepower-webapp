import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { firstValueFrom, timeout } from 'rxjs';
import { environment } from '../../../environments/environment';
export const authInterceptor: HttpInterceptorFn = (req, next) => {
 const token=sessionStorage.getItem('pulsepower.token');
 return next(token && req.url.startsWith(environment.apiUrl + '/') ? req.clone({setHeaders:{Authorization:'Bearer '+token}}) : req);
};
@Injectable({providedIn:'root'})
export class Api {
 private http=inject(HttpClient);
 async call<T=any>(method:string,path:string,body?:unknown):Promise<T> {
  try { return await firstValueFrom(this.http.request<T>(method,environment.apiUrl+path,{body:wire(body)}).pipe(timeout(30000))); }
  catch(e) { if(e instanceof HttpErrorResponse && e.status===401) sessionStorage.removeItem('pulsepower.token'); throw e; }
 }
 get<T=any>(p:string){return this.call<T>('GET',p);}
 post<T=any>(p:string,b:unknown={}){return this.call<T>('POST',p,b);}
 put<T=any>(p:string,b:unknown){return this.call<T>('PUT',p,b);}
 del(p:string){return this.call('DELETE',p);}
}
export function ids(v:any):any { if(Array.isArray(v)) return v.map(ids); if(v && typeof v==='object') return Object.fromEntries(Object.entries(v).map(([k,x])=>[k,(k==='id'||k.endsWith('Id')) && x!=null?String(x):display(k,ids(x))])); return v; }
// Reconcile server collections. New client UUIDs are replaced by server IDs on reload.
export async function reconcile(api:Api,path:string,before:readonly any[],after:readonly any[],update?: (row:any)=>Promise<any>) {
 for(const row of after) {const old=before.find(x=>x.id===row.id); if(!old) await api.post(path,{...row,id:undefined}); else if(JSON.stringify(old)!==JSON.stringify(row)) {if(update) await update(row); else throw Error('This record cannot be edited through the API.');}}
 for(const row of before) if(!after.some(x=>x.id===row.id)) await api.del(path+'/'+row.id);
}

function wire(v:any):any {if(Array.isArray(v))return v.map(wire);if(v && typeof v==='object')return Object.fromEntries(Object.entries(v).map(([k,x])=>[k,['focus','kind','intensity','source','audience'].includes(k)&&typeof x==='string'?x.toLowerCase().replaceAll(' ','-'):wire(x)]));return v;}
function display(k:string,v:any):any {if(typeof v!=='string')return v;if(k==='source')return v==='aioti'?'AIoTI':v.toUpperCase();if(k==='metric')return v.toUpperCase().replaceAll('-','_');if(['status','focus','kind','intensity','visibility'].includes(k)){const values:Record<string,string>={'wellness-seeker':'Wellness Seeker','active-rest':'Active rest'};return values[v]??v.charAt(0).toUpperCase()+v.slice(1);}return v;}
