import { Injectable,inject } from '@angular/core';
import { IdentityGateway } from '../application/identity.service';
import { RegistrationDraft } from '../domain/model/registration';
import { Api,ids } from '../../../shared/infrastructure/api';
@Injectable()
export class HttpIdentityGateway extends IdentityGateway {
 private api=inject(Api);
 async status(){return {onlineAccountsAvailable:true,currentAccount:sessionStorage.getItem('pulsepower.token')?ids(await this.api.get('/users/me')):null};}
 async signIn(email:string,password:string){const r=await this.api.post('/authentication/sign-in',{email,password});sessionStorage.setItem('pulsepower.token',r.token);localStorage.setItem('pulsepower.workspace','personal');localStorage.setItem('pulsepower.account',String(r.account.id));return ids(r.account);}
 async register(fullName:string,email:string,password:string){await this.api.post('/authentication/sign-up',{fullName,email,password,focus:'Athlete',goal:''});const a=await this.signIn(email,password);const d={accountId:a.id,fullName,focus:'Athlete' as const,goal:''};this.saveDraft(d);return d;}
 draft():RegistrationDraft|null{return JSON.parse(sessionStorage.getItem('pulsepower.registration')??'null');}
 saveDraft(d:RegistrationDraft){sessionStorage.setItem('pulsepower.registration',JSON.stringify(d));}
 async complete(d:RegistrationDraft){const a=await this.api.get('/users/me');await this.api.put('/users/me/profile',{...a,displayName:d.fullName,focus:d.focus});if(d.goal && !a.goals.some((g:any)=>g.description===d.goal))await this.api.post('/users/me/goals',{description:d.goal});sessionStorage.removeItem('pulsepower.registration');return ids(await this.api.get('/users/me'));}
 async deleteCurrent(){await this.api.del('/users/me');this.signOut();}
 signOut(){sessionStorage.removeItem('pulsepower.token');sessionStorage.removeItem('pulsepower.registration');localStorage.removeItem('pulsepower.account');}
}
