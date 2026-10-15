import { t } from '@/generated/translations';

type AuthError = 'failed' | 'password';

export function LoginHelp({ error }: { error: AuthError | null }) {
    return (
        <div>
            <h2>{t('Log in')}</h2>
            {error !== null && <p>{t(`auth.${error}`)}</p>}
            <a href="#forgot">{t('Forgot your password?')}</a>
            <p>
                {t('settings/profile.title')}:{' '}
                {t('settings/profile.sections.delete')}
            </p>
        </div>
    );
}
