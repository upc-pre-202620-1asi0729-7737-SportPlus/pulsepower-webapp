export type Locale = 'es' | 'en';
export type TranslationCatalog = Readonly<Record<string, string>>;

export abstract class TranslationLoader {
  abstract load(locale: Locale): Promise<TranslationCatalog>;
  abstract activate(locale: Locale): void;
}
