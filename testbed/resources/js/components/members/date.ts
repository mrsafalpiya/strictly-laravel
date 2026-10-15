const dateFormat = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' });

/** Formats an ISO-8601 string from a CarbonInterface property. */
export function formatDate(iso: string | null): string {
    return iso === null ? '—' : dateFormat.format(new Date(iso));
}
