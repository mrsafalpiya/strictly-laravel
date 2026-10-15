import { choice, t } from '@/generated/translations';

export function ProjectsHeading({
    count,
    archived,
}: {
    count: number;
    archived: number;
}) {
    return (
        <header>
            <h1>{t('projects.index.title')}</h1>
            <p>
                {count === 0
                    ? t('projects.index.empty')
                    : choice('projects.index.count', count, { archived })}
            </p>
        </header>
    );
}
