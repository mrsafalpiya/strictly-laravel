import { FolderKanban, IterationCw, Tags } from 'lucide-react';
import { t } from '@/generated/translations';
import type { WorkspaceNav } from '@/navigation';
import { index as cycles } from '@/routes/cycles';
import { index as labels } from '@/routes/labels';
import { index as projects } from '@/routes/projects';

export default ((workspace) => [
    {
        group: 'workspace',
        order: 40,
        title: t('projects.nav.projects'),
        href: projects(workspace),
        icon: FolderKanban,
    },
    {
        group: 'workspace',
        order: 50,
        title: t('projects.nav.cycles'),
        href: cycles(workspace),
        icon: IterationCw,
    },
    {
        group: 'manage',
        order: 10,
        title: t('projects.nav.labels'),
        href: labels(workspace),
        icon: Tags,
    },
]) satisfies WorkspaceNav;
