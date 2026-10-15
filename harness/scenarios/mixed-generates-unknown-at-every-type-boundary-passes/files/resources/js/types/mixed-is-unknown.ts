import type {
    IssueData,
    IssueFiltersData,
    IssuePreviewData,
    PageProps,
    SharedProps,
    StoreIssueData,
} from '@/generated';
import type { BroadcastEvents } from '@/generated/broadcasting';

// True only when A and B are the same type: `any` is neither `unknown` nor anything else.
type Equals<A, B> =
    (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
        ? true
        : false;
type Expect<T extends true> = T;

type Show = PageProps<'issues/show'>;
type Imported = BroadcastEvents['IssueImported'];
type AnyArray = unknown[] | Record<string, unknown>;

export type MixedIsUnknown = [
    // A Data class, and mixed inside its arrays.
    Expect<Equals<IssueData['meta'], unknown>>,
    Expect<Equals<IssueData['customFields'], Record<string, unknown>>>,
    Expect<Equals<IssueData['history'], unknown[]>>,
    Expect<Equals<IssueData['import']['source'], unknown>>,
    Expect<Equals<IssueData['votes'], Record<string, unknown[]>>>,
    Expect<Equals<IssueData['labels'], unknown[]>>,
    Expect<Equals<IssueData['raw'], AnyArray>>,
    // A Page class.
    Expect<Equals<Show['context'], unknown>>,
    Expect<Equals<Show['filters'], Record<string, unknown>>>,
    // The shared props.
    Expect<Equals<SharedProps['features'], Record<string, unknown>>>,
    // An input class and a query class.
    Expect<Equals<StoreIssueData['customFields'], Record<string, unknown>>>,
    Expect<Equals<StoreIssueData['attachment'], unknown>>,
    Expect<Equals<IssueFiltersData['customFields'], Record<string, unknown>>>,
    // A JSON response.
    Expect<Equals<IssuePreviewData['blocks'], unknown[]>>,
    Expect<Equals<IssuePreviewData['warnings'], unknown>>,
    // A broadcast payload.
    Expect<Equals<Imported['meta'], unknown>>,
];
