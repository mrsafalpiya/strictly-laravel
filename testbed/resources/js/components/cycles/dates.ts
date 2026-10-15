/** Helpers for the server's `#[DateOnly]` strings ("2026-10-14"), which carry no time zone. */

/** Midnight local time, so the date never shifts a day in negative UTC offsets. */
export const parseDateOnly = (date: string): Date =>
    new Date(`${date}T00:00:00`);

/** Whole days from `from` to `to` (rounded: DST days are 23 or 25 hours long). */
export const daysBetween = (from: string, to: string): number =>
    Math.round(
        (parseDateOnly(to).getTime() - parseDateOnly(from).getTime()) /
            86_400_000,
    );

export const formatDateOnly = (date: string): string =>
    parseDateOnly(date).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
    });

export const formatRange = (startsOn: string, endsOn: string): string =>
    `${formatDateOnly(startsOn)} – ${formatDateOnly(endsOn)}`;
