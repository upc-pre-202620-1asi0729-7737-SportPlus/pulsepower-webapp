import { Injectable, inject } from '@angular/core';
import { BrowserPreferences } from './ports/browser-preferences';

@Injectable({ providedIn: 'root' })
export class WorkspaceMode {
  private readonly preferences = inject(BrowserPreferences);
  readonly mode =
    this.preferences.read('pulsepower.workspace') === 'personal' ? 'personal' : 'demo';
  setMode(mode: string): void {
    if (mode !== 'demo' && mode !== 'personal') return;
    this.preferences.write('pulsepower.workspace', mode);
    this.preferences.reload();
  }
}
