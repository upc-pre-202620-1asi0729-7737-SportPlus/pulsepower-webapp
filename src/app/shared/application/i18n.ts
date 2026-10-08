import { Injectable, Pipe, PipeTransform, inject, signal } from '@angular/core';
import { DOCUMENT, formatDate, registerLocaleData } from '@angular/common';
import spanishLocale from '@angular/common/locales/es-419';
import { Locale, TranslationCatalog, TranslationLoader } from './ports/translation-loader';
import { BrowserPreferences } from './ports/browser-preferences';

registerLocaleData(spanishLocale);
export type { Locale } from './ports/translation-loader';
export type TranslationKey =
  | 'home'
  | 'training'
  | 'sleep'
  | 'wellness'
  | 'recovery'
  | 'planning'
  | 'reports'
  | 'community'
  | 'settings'
  | 'assistant'
  | 'save'
  | 'cancel'
  | 'loading'
  | 'empty'
  | 'appName'
  | 'tagline';

@Injectable({ providedIn: 'root' })
export class I18n {
  private readonly document = inject(DOCUMENT);
  private readonly loader = inject(TranslationLoader);
  private readonly preferences = inject(BrowserPreferences);
  private catalogs: Record<Locale, TranslationCatalog> = { en: {}, es: {} };
  private initialization?: Promise<void>;
  private readonly language = signal<Locale>(this.savedLocale());
  readonly locale = this.language.asReadonly();
  constructor() {
    this.document.documentElement.lang = this.locale() === 'es' ? 'es-419' : 'en';
  }
  initialize(): Promise<void> {
    return (this.initialization ??= Promise.all([
      this.loader.load('en'),
      this.loader.load('es'),
    ]).then(([en, es]) => {
      this.catalogs = { en, es };
      this.loader.activate(this.locale());
    }));
  }
  private interpolate(key: string, values: Record<string, string>): string {
    return this.text(key).replace(
      /\{(\w+)\}/g,
      (placeholder, name: string) => values[name] ?? placeholder,
    );
  }
  dateFormat(format: string): string {
    return this.catalogs[this.locale()][`_date.${format}`] ?? format;
  }
  setLocale(locale: string): void {
    if (locale !== 'es' && locale !== 'en') return;
    this.language.set(locale);
    this.document.documentElement.lang = locale === 'es' ? 'es-419' : 'en';
    this.loader.activate(locale);
    try {
      this.preferences.write('pulsepower.locale', locale);
    } catch {
      /* Language still changes for this visit. */
    }
  }
  text(value: unknown): string {
    if (typeof value === 'number')
      return new Intl.NumberFormat(this.locale(), { maximumFractionDigits: 2 }).format(value);
    const original = String(value ?? '');
    const english = Object.hasOwn(this.catalogs.en, original)
      ? (this.catalogs.en[original] ?? original)
      : original;
    if (this.locale() === 'en') return english;
    const normalized = english.replace(/\s+/g, ' ').trim();
    const translated =
      this.catalogs[this.locale()][original] ?? this.catalogs[this.locale()][normalized];
    if (translated !== undefined) return translated;
    const reportDate = normalized.match(
      /^Earliest report date: (\d{4}-\d{2}-\d{2})\. Continue recording data to complete a week\.$/,
    );
    if (reportDate) return this.interpolate('_report.available', { date: reportDate[1]! });
    if (/^\d+\.\d+$/.test(normalized)) return normalized.replace('.', ',');
    const numeric = normalized.match(/^(.*) must be between (.+) and (.+)\.$/);
    if (numeric)
      return this.interpolate('_validation.range', {
        label: this.text(numeric[1]!),
        min: numeric[2]!,
        max: numeric[3]!,
      });
    const length = normalized.match(/^(.*) must contain 1–(\d+) characters\.$/);
    if (length)
      return this.interpolate('_validation.length', {
        label: this.text(length[1]!),
        max: length[2]!,
      });
    const max = normalized.match(/^(.*) cannot exceed (\d+) characters\.$/);
    if (max)
      return this.interpolate('_validation.max', { label: this.text(max[1]!), max: max[2]! });
    const choice = normalized.match(/^Choose a valid (.*)\.$/);
    if (choice) return this.interpolate('_validation.choice', { label: this.text(choice[1]) });
    for (const [prefix, translated] of [
      ['Add activity on ', '_prefix.activity'],
      ['Toggle goal: ', '_prefix.goal'],
      ['Download report ', '_prefix.download'],
      ['Complete ', '_prefix.complete'],
      ['Undo ', '_prefix.undo'],
    ] as const) {
      if (english.startsWith(prefix))
        return this.interpolate(translated, { value: this.text(english.slice(prefix.length)) });
    }
    if (english.includes(' · '))
      return english
        .split(' · ')
        .map((part) => this.text(part))
        .join(' · ');
    return english;
  }
  private savedLocale(): Locale {
    try {
      return this.preferences.read('pulsepower.locale') === 'es' ? 'es' : 'en';
    } catch {
      return 'en';
    }
  }
}
@Pipe({ name: 't', pure: false })
export class Translate implements PipeTransform {
  private readonly i18n = inject(I18n);
  transform(key: unknown): string {
    return this.i18n.text(key);
  }
}
@Pipe({ name: 'localDate', pure: false })
export class LocalizedDate implements PipeTransform {
  private readonly i18n = inject(I18n);
  transform(value: string | number | Date | null | undefined, format = 'mediumDate'): string {
    const localizedFormat = this.i18n.dateFormat(format);
    return value == null
      ? ''
      : formatDate(value, localizedFormat, this.i18n.locale() === 'es' ? 'es-419' : 'en');
  }
}
