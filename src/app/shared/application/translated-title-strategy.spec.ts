import '@angular/compiler';
import { createEnvironmentInjector, runInInjectionContext } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot } from '@angular/router';
import { describe, expect, it } from 'vitest';
import { I18n } from './i18n';
import { TranslatedTitleStrategy } from './translated-title-strategy';
describe('TranslatedTitleStrategy', () => {
  it('translates the page part of the title and updates it when the language changes', () => {
    let current = '';
    let locale = 'en';
    const listeners: (() => void)[] = [];
    const catalog: Record<string, Record<string, string>> = { es: { Sleep: 'Sueño' }, en: {} };
    const injector = createEnvironmentInjector(
      [
        { provide: Title, useValue: { setTitle: (value: string) => (current = value) } },
        {
          provide: I18n,
          useValue: {
            text: (value: string) => catalog[locale]![value] ?? value,
            onLocaleChange: (listener: () => void) => listeners.push(listener),
          },
        },
      ],
      null as never,
    );
    const strategy = runInInjectionContext(injector, () => new TranslatedTitleStrategy());
    strategy.buildTitle = () => 'Sleep | PulsePower';
    strategy.updateTitle({} as RouterStateSnapshot);
    expect(current).toBe('Sleep | PulsePower');
    locale = 'es';
    listeners.forEach((listener) => listener());
    expect(current).toBe('Sueño | PulsePower');
    injector.destroy();
  });
});
