import '@angular/compiler';
import { createEnvironmentInjector, runInInjectionContext } from '@angular/core';
import { HttpClient, HttpRequest, HttpResponse } from '@angular/common/http';
import { of } from 'rxjs';
import { describe, it, expect, vi } from 'vitest';
import { Api, ids, authInterceptor } from './api';
import { HttpIdentityGateway } from '../../modules/iam/infrastructure/http-identity-gateway';
import { HttpSleepRepository } from '../../modules/sleep/infrastructure/http-sleep-repository';
import { environment } from '../../../environments/environment';
const storage=()=>{const m=new Map<string,string>();return {getItem:(k:string)=>m.get(k)??null,setItem:(k:string,v:string)=>m.set(k,v),removeItem:(k:string)=>m.delete(k)};};
function setup(respond:(method:string,url:string,body:any)=>any){
 vi.stubGlobal('sessionStorage',storage());vi.stubGlobal('localStorage',storage());
 const request=vi.fn((method:string,url:string,options:any)=>of(respond(method,url,options.body)));
 const injector=createEnvironmentInjector([Api,{provide:HttpClient,useValue:{request}}],null as never);
 return {request,make:<T>(factory:()=>T)=>runInInjectionContext(injector,factory)};
}
describe('API integration contracts',()=>{
 it('authenticates against the backend, stores its token and normalizes numeric IDs',async()=>{
 const s=setup(()=>({account:{id:7,email:'test@example.com',status:'active'},token:'jwt-test'}));
 const gateway=s.make(()=>new HttpIdentityGateway());
 expect(await gateway.signIn('test@example.com','password123')).toMatchObject({id:'7',status:'Active'});
 expect(sessionStorage.getItem('pulsepower.token')).toBe('jwt-test');
 expect(s.request.mock.calls[0]?.[1]).toBe(environment.apiUrl+'/authentication/sign-in');
 });
 it('only attaches the bearer token to this API',()=>{
 setup(()=>null);sessionStorage.setItem('pulsepower.token','jwt-test');
 const next=vi.fn(()=>of(new HttpResponse()));
 authInterceptor(new HttpRequest('GET',environment.apiUrl+'/users/me'),next);
 expect(next.mock.calls[0]?.[0]?.headers.get('Authorization')).toBe('Bearer jwt-test');
 authInterceptor(new HttpRequest('GET','https://other.example/data'),next);
 expect(next.mock.calls[1]?.[0]?.headers.has('Authorization')).toBe(false);
 });
 it('replaces a simulated night atomically rather than deleting it before creating',async()=>{
 const old={id:8,startedAt:'2026-10-24T01:00:00Z',endedAt:'2026-10-24T08:00:00Z',source:'aioti',sleepScore:80,notes:''};
 const s=setup((method,url)=>method==='GET'&&url.endsWith('/records')?[old]:null);
 const repo=s.make(()=>new HttpSleepRepository());
 await repo.save({records:[{...old,id:'new-uuid',source:'AIoTI',sleepScore:90}],routine:null});
 const mutations=s.request.mock.calls.filter(c=>c[0]!=='GET');
 expect(mutations).toHaveLength(1);expect(mutations[0]?.[0]).toBe('PUT');
 expect(mutations[0]?.[1]).toBe(environment.apiUrl+'/sleep/records/8');
 });
 it('maps server vocabulary to UI vocabulary',()=>{
 expect(ids({id:1,focus:'wellness-seeker',kind:'active-rest',source:'aioti',metric:'resting-hr'})).toEqual({id:'1',focus:'Wellness Seeker',kind:'Active rest',source:'AIoTI',metric:'RESTING_HR'});
 });
});
