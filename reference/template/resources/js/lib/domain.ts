import { enumValues } from '@/generated';
import type { ToastType } from '@/types';

/*
 * Presentation metadata for PHP enums (labels, colours, icons). Each map is
 * `satisfies Record<Enum, …>`, so adding a case to the PHP enum fails `tsc` here
 * until the UI handles it. Keep one map per enum in this file.
 */

export const toastTypes = {
    success: 'Success',
    info: 'Info',
    warning: 'Warning',
    error: 'Error',
} as const satisfies Record<ToastType, string>;

/** Ordered values for pickers, generated from the PHP enum (case order; int-backed enums stay numbers). */
export const toastTypeValues = enumValues.ToastType;

/**
 * The given values, checked to be every member of `T` — for literal unions that aren't PHP enums
 * (`allOf<WeekStart>()('monday', 'sunday')` fails to compile when a member is missing).
 */
export const allOf =
    <T extends string | number>() =>
    <const V extends readonly T[]>(
        ...values: V &
            ([Exclude<T, V[number]>] extends [never]
                ? unknown
                : { missing: Exclude<T, V[number]> })
    ): readonly T[] =>
        values;
