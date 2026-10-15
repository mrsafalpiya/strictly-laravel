/**
 * The values of a message's `:params`, by name: `{ seconds: 5 }` for `'Try again in :seconds seconds.'`.
 */
export type TranslationParams<Param extends string> = { [Name in Param]: string | number };

/**
 * What `t()` takes after the key: nothing for a message without `:params`, else a value for each of them (Problem
 * P-056).
 */
export type TranslationArgs<Keys extends Record<string, string>, Key extends keyof Keys> = [Keys[Key]] extends [never]
    ? []
    : [params: TranslationParams<Keys[Key] & string>];

/** A `t()` bound to an app's translations, as `@/generated/translations` exports it. */
export interface Translator<Keys extends Record<string, string>, Locale extends string> {
    /**
     * The message of `key` in the current locale (falling back to the default locale's), with its `:params` filled.
     * `key` must be a key of the default locale's lang files (Problem P-055), and `params` must name exactly the
     * message's `:params` (Problem P-056).
     */
    t: <Key extends Extract<keyof Keys, string>>(key: Key, ...params: TranslationArgs<Keys, Key>) => string;
    /** The locale `t()` translates into. */
    locale: () => Locale;
    /** Translate into another locale from now on. Components rendered already keep their text until they render again. */
    setLocale: (locale: Locale) => void;
}

/**
 * Bind `t()` to an app's translations: `Keys` maps every key of the default locale to its `:param` names, and
 * `modules` holds each locale's messages by the path of its JSON file, as `import.meta.glob()` returns them.
 * `@/generated/translations` calls it; apps import `t` from there.
 */
export function createTranslator<Keys extends Record<string, string>, Locale extends string>(
    defaultLocale: Locale,
    modules: Record<string, Record<string, string>>,
): Translator<Keys, Locale>;
