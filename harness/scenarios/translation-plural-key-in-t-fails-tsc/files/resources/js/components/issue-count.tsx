import { t } from '@/generated/translations';

export function IssueCount({ count }: { count: number }) {
    return <p>{t('issues.count', { count })}</p>;
}
