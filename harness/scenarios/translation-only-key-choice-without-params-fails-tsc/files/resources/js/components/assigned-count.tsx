import { choice } from '@/generated/translations';

export function AssignedCount({ count }: { count: number }) {
    return <p>{choice('issues.assigned', count)}</p>;
}
