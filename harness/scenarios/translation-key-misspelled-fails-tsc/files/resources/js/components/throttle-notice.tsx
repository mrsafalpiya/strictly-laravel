import { t } from '@/generated/translations';

export function ThrottleNotice({ seconds }: { seconds: number }) {
    return <p>{t('auth.throtle', { seconds })}</p>;
}
