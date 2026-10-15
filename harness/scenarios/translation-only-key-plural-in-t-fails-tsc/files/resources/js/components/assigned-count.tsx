import { t } from '@/generated/translations';

export function AssignedCount({ count, name }: { count: number; name: string }) {
    return <p>{t('issues.assigned', { count, name })}</p>;
}
