import {Injectable,inject} from '@angular/core';
import {Api,ids} from '../../../shared/infrastructure/api';
import {SubscriptionGateway} from '../application/subscription.service';
@Injectable() export class HttpSubscriptionGateway extends SubscriptionGateway {
private api=inject(Api);async load(){const [plans,subscription]=await Promise.all([this.api.get('/subscriptions/plans'),this.api.get('/subscriptions/me')]);return ids({available:true,plans,subscription});}
async activateDemo(){const r=await this.load();const plan=r.plans.find((p:any)=>p.name==='Pro');if(!plan)throw Error('Pro plan unavailable.');await this.api.post('/subscriptions/me',{planId:Number(plan.id)});return this.load();}
async cancel(){await this.api.post('/subscriptions/me/cancel');return this.load();}}
