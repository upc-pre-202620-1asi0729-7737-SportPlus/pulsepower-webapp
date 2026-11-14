import { Injectable, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { I18n } from './i18n';

/** Translates route titles ("Sleep | PulsePower") and updates them when the language changes. */
@Injectable()
export class TranslatedTitleStrategy extends TitleStrategy {
  private readonly title = inject(Title);
  private readonly i18n = inject(I18n);
  private current: string | undefined;
  constructor() {
    super();
    this.i18n.onLocaleChange(() => this.apply());
  }
  override updateTitle(snapshot: RouterStateSnapshot): void {
    this.current = this.buildTitle(snapshot);
    this.apply();
  }
  private apply(): void {
    if (!this.current) return;
    const [page = '', ...brand] = this.current.split(' | ');
    this.title.setTitle([this.i18n.text(page), ...brand].join(' | '));
  }
}
