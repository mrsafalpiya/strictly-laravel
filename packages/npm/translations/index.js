// @ts-check
/**
 * The typed `t()` (ADR-0006). `php artisan strictly:generate` writes `@/generated/translations`, which calls
 * `createTranslator()` with the app's default locale and every locale's messages (generated JSON that Vite bundles),
 * typed by the default locale's keys and `:param` names.
 */

/** A `:param` placeholder, as Laravel's translator fills it. */
const placeholder = /:([A-Za-z][A-Za-z0-9_]*)/g;

/**
 * @param {string} defaultLocale
 * @param {Record<string, Record<string, string>>} modules the messages of each locale, by the path of its JSON file
 *   (`./lang/de.json`), as `import.meta.glob()` returns them
 */
export function createTranslator(defaultLocale, modules) {
    /** @type {Map<string, Record<string, string>>} */
    const messages = new Map();

    for (const [path, localeMessages] of Object.entries(modules)) {
        const locale = /([^/]+)\.json$/.exec(path)?.[1];

        if (locale !== undefined) {
            messages.set(locale, localeMessages);
        }
    }

    let current = defaultLocale;

    /**
     * @param {string} locale
     * @param {string} key
     * @returns {string | undefined}
     */
    const lookup = (locale, key) => {
        const localeMessages = messages.get(locale);

        return localeMessages !== undefined && Object.hasOwn(localeMessages, key) ? localeMessages[key] : undefined;
    };

    return {
        /**
         * @param {string} key
         * @param {Record<string, string | number>} [params]
         */
        t: (key, params) => {
            const message = lookup(current, key) ?? lookup(defaultLocale, key) ?? key;

            return params === undefined ? message : replaceParams(message, params);
        },
        locale: () => current,
        /** @param {string} locale */
        setLocale: (locale) => {
            current = locale;
        },
    };
}

/**
 * Fill a message's `:params` the way Laravel's translator does: `:name` takes the value as it is, `:Name` with its
 * first letter upper-cased and `:NAME` upper-cased. A placeholder no param fills stays as it is.
 *
 * @param {string} message
 * @param {Record<string, string | number>} params
 */
function replaceParams(message, params) {
    /** @type {Map<string, string>} */
    const replacements = new Map();

    for (const [name, raw] of Object.entries(params)) {
        const value = String(raw);
        replacements.set(ucfirst(name), ucfirst(value));
        replacements.set(name.toUpperCase(), value.toUpperCase());
        replacements.set(name, value);
    }

    return message.replace(placeholder, (match, name) => replacements.get(name) ?? match);
}

/** @param {string} value */
function ucfirst(value) {
    return value.charAt(0).toUpperCase() + value.slice(1);
}
