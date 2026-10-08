import { Signal } from '@angular/core';
export abstract class ShellState {
  abstract readonly name: Signal<string>;
  abstract readonly initials: Signal<string>;
  abstract initialize(): Promise<void>;
}
