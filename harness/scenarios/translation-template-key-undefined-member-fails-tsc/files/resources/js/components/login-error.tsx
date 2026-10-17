import { t } from '@/generated/translations';

type AuthError = 'failed' | 'password' | 'locked';

export function LoginError({ error }: { error: AuthError }) {
    return <p>{t(`auth.${error}`)}</p>;
}
