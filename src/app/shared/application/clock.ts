import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class Clock {
  now(): Date {
    return new Date();
  }
  id(): string {
    return crypto.randomUUID();
  }
  today(): string {
    const date = this.now();
    return [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, '0'),
      String(date.getDate()).padStart(2, '0'),
    ].join('-');
  }
}
