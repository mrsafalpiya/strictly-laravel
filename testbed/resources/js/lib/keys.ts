/**
 * The key a `<Select>` value names: the one of `keys` whose `String()` it is, or null for any other value (the "none"
 * item). A select's value is a string, and `Number(value)` would be a plain number, which an input's model key
 * (`Key<'User', 'id', number>`, `#[KeyOf(User::class)]`) doesn't take: looking it up among the options the server sent
 * keeps the brand, so only one of their keys can be chosen.
 */
export function selectedKey<TKey extends string | number>(
    keys: readonly TKey[],
    value: string,
): TKey | null {
    return keys.find((key) => String(key) === value) ?? null;
}
