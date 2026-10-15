import {
    locale,
    setLocale,
    t,
    type TranslationLocale,
} from '@/generated/translations';

export function LoginNotice({
    name,
    seconds,
    language,
}: {
    name: string;
    seconds: number;
    language: TranslationLocale;
}) {
    if (locale() !== language) {
        setLocale(language);
    }

    return (
        <div>
            <h2>{t('Log in')}</h2>
            <p>{t('Welcome back, :name!', { name })}</p>
            <p>{t('auth.throttle', { seconds })}</p>
        </div>
    );
}
