export abstract class BrowserPreferences {
  abstract read(key: string): string | null;
  abstract write(key: string, value: string): void;
  abstract reload(): void;
}
