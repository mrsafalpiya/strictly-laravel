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

/**
 * The params `choice()` takes besides the count: the message's other `:params`, and optionally `count`, which replaces
 * the count in `:count` (a formatted number, say), as in Laravel's `trans_choice()`.
 */
export type ChoiceParams<Param extends string> = { [Name in Exclude<Param, 'count'>]: string | number } & {
    count?: string | number;
};

/** Whether `T` is a union of more than one type. */
type IsUnion<T, All = T> = T extends unknown ? ([All] extends [T] ? false : true) : never;

/**
 * Whether `Key` is every key: TypeScript falls back to the constraint when the argument is no key at all. An app with
 * a single key can't fall back to anything else, so its one key is always the key it names.
 */
type IsEveryKey<AnyKey extends string, Key extends AnyKey> = [AnyKey] extends [Key] ? IsUnion<AnyKey> : false;

/**
 * What `choice()` takes after the count: params when the message has `:params` other than `:count`, else optionally
 * a `count` to show instead of the count. For a key that isn't one (`Key` fell back to every key), the params are
 * optional, so `tsc` reports the key rather than a missing argument.
 */
export type ChoiceArgs<Keys extends Record<string, string>, Key extends keyof Keys> =
    IsEveryKey<Extract<keyof Keys, string>, Extract<Key, string>> extends true
    ? [params?: ChoiceParams<Keys[Key] & string>]
    : [Exclude<Keys[Key], 'count'>] extends [never]
      ? [params?: ChoiceParams<never>]
      : [params: ChoiceParams<Keys[Key] & string>];

/**
 * The key `t()` takes (Problem P-136): a pluralised message's key becomes a message naming `choice()`, so `tsc` says
 * which function to call. A key that isn't one at all stays `keyof Keys` (the constraint TypeScript falls back to), so
 * its diagnostic names the keys' type.
 */
export type SingularKey<AnyKey extends string, PluralKey extends string, Key extends AnyKey> =
    IsEveryKey<AnyKey, Key> extends true
    ? Key
    : Key extends PluralKey
      ? `${Key} is a plural message: use choice()`
      : Key;

/** The key `choice()` takes (Problem P-136): a key whose message isn't pluralised becomes a message naming `t()`. */
export type PluralKeyArg<AnyKey extends string, PluralKey extends string, Key extends AnyKey> =
    IsEveryKey<AnyKey, Key> extends true
    ? Key
    : Key extends PluralKey
      ? Key
      : `${Key} is not a plural message: use t()`;

/** `t()` and `choice()` bound to an app's translations, as `@/generated/translations` exports them. */
export interface Translator<Keys extends Record<string, string>, Locale extends string, PluralKey extends string = never> {
    /**
     * The message of `key` in the current locale (falling back to the default locale's), with its `:params` filled.
     * `key` must be a key of the default locale's lang files (Problem P-055) whose message isn't pluralised (Problem
     * P-136), and `params` must name exactly the message's `:params` (Problem P-056).
     */
    t: <Key extends Extract<keyof Keys, string>>(
        key: SingularKey<Extract<keyof Keys, string>, PluralKey, Key>,
        ...params: TranslationArgs<Keys, Key>
    ) => string;
    /**
     * The form of a pluralised (`|`) message for `count`, picked as Laravel's `trans_choice()` picks it: the form whose
     * `{n}` or `[from,to]` range holds the count, else the one the locale's plural rule picks. `:count` shows the
     * count; `params` fills the message's other `:params` (Problem P-136).
     */
    choice: <Key extends Extract<keyof Keys, string>>(
        key: PluralKeyArg<Extract<keyof Keys, string>, PluralKey, Key>,
        count: number,
        ...params: ChoiceArgs<Keys, Key>
    ) => string;
    /** The locale `t()` translates into. */
    locale: () => Locale;
    /** Translate into another locale from now on. Components rendered already keep their text until they render again. */
    setLocale: (locale: Locale) => void;
}

/**
 * Bind `t()` and `choice()` to an app's translations: `Keys` maps every key of the default locale to its `:param`
 * names, `PluralKey` names the keys whose message is pluralised, and `modules` holds each locale's messages by the
 * path of its JSON file, as `import.meta.glob()` returns them. `@/generated/translations` calls it; apps import `t`
 * and `choice` from there.
 */
export function createTranslator<Keys extends Record<string, string>, Locale extends string, PluralKey extends string = never>(
    defaultLocale: Locale,
    modules: Record<string, Record<string, string>>,
): Translator<Keys, Locale, PluralKey>;
