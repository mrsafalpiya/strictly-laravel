export function mapValues<K extends string, V, W>(
    record: Record<K, V>,
    map: (value: V) => W,
): Record<K, W> {
    // oxlint-disable-next-line typescript/consistent-type-assertions -- Object.fromEntries types its keys as string; they are the record's own keys
    return Object.fromEntries(
        Object.entries<V>(record).map(([key, value]) => [key, map(value)]),
    ) as Record<K, W>;
}
