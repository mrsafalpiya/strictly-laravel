// @ts-check
// The runtime half of `@mrsafalpiya/strictly-laravel/routes`: the helpers that work with its types. Plain JS (no build
// step), typed by index.d.ts next to it.

/**
 * The key a `<Select>` value names: the one of `keys` whose `String()` it is, or null for any other value (the "none"
 * item). A select's value is a string, and `Number(value)` would be a plain number, which an input's model key
 * (`Key<'User', 'id', number>`, `#[KeyOf(User::class)]`) doesn't take: looking it up among the options the server sent
 * keeps the brand, so only one of their keys can be chosen (Problem P-128).
 *
 * @template {string | number} TKey
 * @param {readonly TKey[]} keys
 * @param {string} value
 * @returns {TKey | null}
 */
export function selectedKey(keys, value) {
    return keys.find((key) => String(key) === value) ?? null;
}
