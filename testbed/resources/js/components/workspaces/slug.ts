/** Mirrors StoreWorkspaceData::SLUG_PATTERN (the server is the authority; this only drives the suggestion). */
export const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** "Acme Labs, Inc." → "acme-labs-inc" */
export function slugify(name: string): string {
    return name
        .normalize('NFKD')
        .replace(/[̀-ͯ]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 50)
        .replace(/-+$/g, '');
}
