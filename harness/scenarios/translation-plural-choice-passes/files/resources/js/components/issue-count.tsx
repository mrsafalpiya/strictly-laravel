import { choice, t } from '@/generated/translations';

export function IssueCount({
    count,
    assignee,
}: {
    count: number;
    assignee: string;
}) {
    return (
        <section>
            <h2>{t('issues.title')}</h2>
            <p>{choice('issues.count', count)}</p>
            <p>
                {choice('issues.count', count, {
                    count: count.toLocaleString(),
                })}
            </p>
            <p>{choice('issues.assigned', count, { name: assignee })}</p>
        </section>
    );
}
