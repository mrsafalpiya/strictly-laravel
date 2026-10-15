import { t } from '@/generated/translations';

export function InboxSummary({ name, unread }: { name: string; unread: number }) {
    return (
        <div>
            <h2>{t('inbox.greeting', { name })}</h2>
            <p>
                {unread === 0
                    ? t('inbox.empty')
                    : t('inbox.unread', {
                          count: unread,
                          items: 'issues',
                          name,
                          time: '10:30',
                      })}
            </p>
        </div>
    );
}
