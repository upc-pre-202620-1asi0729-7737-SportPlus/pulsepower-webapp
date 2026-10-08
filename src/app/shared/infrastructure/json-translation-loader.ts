import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import {
  Locale,
  TranslationCatalog,
  TranslationLoader,
} from '../application/ports/translation-loader';
@Injectable()
export class JsonTranslationLoader extends TranslationLoader {
  private readonly http = inject(HttpClient);
  private readonly catalogs = new Map<Locale, Promise<TranslationCatalog>>();
  activate(_locale: Locale): void {}
  load(locale: Locale): Promise<TranslationCatalog> {
    let pending = this.catalogs.get(locale);
    if (!pending) {
      pending = firstValueFrom(this.http.get<TranslationCatalog>('i18n/' + locale + '.json'));
      this.catalogs.set(locale, pending);
    }
    return pending;
  }
}
