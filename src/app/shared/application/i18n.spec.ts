import '@angular/compiler';
import { createEnvironmentInjector, runInInjectionContext } from '@angular/core';
import { DOCUMENT, formatDate } from '@angular/common';
import { I18n } from './i18n';
import { TranslationLoader } from './ports/translation-loader';
import { BrowserPreferences } from './ports/browser-preferences';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('Public translation catalogs', () => {
  const en: Record<string, string> = JSON.parse(readFileSync('public/i18n/en.json', 'utf8'));
  const es: Record<string, string> = JSON.parse(readFileSync('public/i18n/es.json', 'utf8'));
  it('provides matching keys and interpolation parameters for both languages', () => {
    expect(Object.keys(en).sort()).toEqual(Object.keys(es).sort());
    for (const key of Object.keys(en)) {
      expect(typeof es[key]).toBe('string');
      expect(es[key].length).toBeGreaterThan(0);
      expect(es[key].match(/\{\w+\}/g)?.sort() ?? []).toEqual(
        en[key].match(/\{\w+\}/g)?.sort() ?? [],
      );
    }
  });
  it('contains the navigation and settings labels in each language', () => {
    expect(en['home']).toBe('Home');
    expect(es['home']).toBe('Inicio');
    expect(en['settings']).toBe('Settings');
    expect(es['settings']).toBe('Configuración');
  });
});

describe('Language preference', () => {
  function setup(saved: string | null = null, unavailable = false) {
    const document = { documentElement: { lang: '' } };
    const values = new Map<string, string>();
    if (saved) values.set('pulsepower.locale', saved);
    const injector = createEnvironmentInjector(
      [
        { provide: DOCUMENT, useValue: document },
        { provide: TranslationLoader, useValue: { load: async () => ({}), activate: () => {} } },
        {
          provide: BrowserPreferences,
          useValue: {
            read: (key: string) => {
              if (unavailable) throw Error('Storage unavailable');
              return values.get(key) ?? null;
            },
            write: (key: string, value: string) => values.set(key, value),
          },
        },
      ],
      null as never,
    );
    const i18n = runInInjectionContext(injector, () => new I18n());
    return { i18n, document, values, injector };
  }
  it('starts in English with no saved preference or inaccessible storage', () => {
    for (const unavailable of [false, true]) {
      const context = setup(null, unavailable);
      expect(context.i18n.locale()).toBe('en');
      expect(context.document.documentElement.lang).toBe('en');
      context.injector.destroy();
    }
  });
  it('sets Latin American Spanish and preserves the saved preference on a new visit', () => {
    const context = setup();
    context.i18n.setLocale('es');
    expect(context.document.documentElement.lang).toBe('es-419');
    const restored = setup(context.values.get('pulsepower.locale'));
    expect(restored.i18n.locale()).toBe('es');
    expect(restored.document.documentElement.lang).toBe('es-419');
    expect(formatDate('2026-10-08', 'MMMM', 'es-419')).toBe('octubre');
    restored.i18n.setLocale('en');
    expect(restored.document.documentElement.lang).toBe('en');
    context.injector.destroy();
    restored.injector.destroy();
  });
});
