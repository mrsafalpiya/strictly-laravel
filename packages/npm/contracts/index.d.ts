/**
 * The type a recorded Contract of a value of type T is checked against: what the server can send for T as JSON. The
 * Contracts that feature tests record (resources/js/__contracts__, written by the Composer package's ContractRecorder)
 * are checked with it:
 *
 *     export const props = { … } satisfies Contract<PageProps<'members'>>;
 *
 * It is T, except that PHP has no empty map: `json_encode()` sends an empty array as `[]` whatever its keys would have
 * been (Problem P-076). So an object type with no required property (a map such as `Partial<Record<Status, number>>`
 * or `Record<string, number>`, or a Data object whose props are all optional) may arrive as `[]`, at any depth. Reading
 * such a value by key still gives `undefined`, as its type allows. Nothing else is relaxed: a non-empty list sent for a
 * map, or `[]` for an object with a required property, still fails.
 */
export type Contract<T> = T extends readonly unknown[]
    ? { [K in keyof T]: Contract<T[K]> }
    : T extends object
      ? {} extends T
          ? { [K in keyof T]: Contract<T[K]> } | []
          : { [K in keyof T]: Contract<T[K]> }
      : T;
