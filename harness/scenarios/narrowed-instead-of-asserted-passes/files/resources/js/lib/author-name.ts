// meta is mixed in PHP, so unknown here: a type guard narrows it.
function hasName(meta: unknown): meta is { name: string } {
    return (
        typeof meta === 'object' &&
        meta !== null &&
        'name' in meta &&
        typeof meta.name === 'string'
    );
}

export const authorName = (meta: unknown): string =>
    hasName(meta) ? meta.name : 'Unknown author';

export const sortOrders = ['newest', 'oldest'] as const;
