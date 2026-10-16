import { choice } from '@/generated/translations';

export function IssueCount({ count }: { count: number }) {
    return <p>{choice('issues.title', count)}</p>;
}
