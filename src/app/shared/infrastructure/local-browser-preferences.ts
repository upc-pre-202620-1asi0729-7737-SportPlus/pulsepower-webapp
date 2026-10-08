import { Injectable } from '@angular/core';
import { BrowserPreferences } from '../application/ports/browser-preferences';

@Injectable()
export class LocalBrowserPreferences extends BrowserPreferences {
  read(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }
  write(key: string, value: string): void {
    localStorage.setItem(key, value);
  }
  reload(): void {
    location.reload();
  }
}
