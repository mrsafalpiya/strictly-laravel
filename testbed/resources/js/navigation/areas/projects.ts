import { FolderKanban, IterationCw, Tags } from 'lucide-react';
import type { WorkspaceNav } from '@/navigation';
import { index as cycles } from '@/routes/cycles';
import { index as labels } from '@/routes/labels';
import { index as projects } from '@/routes/projects';

export default ((workspace) => [
    {
        group: 'workspace',
        order: 40,
        title: 'Projects',
        href: projects(workspace),
        icon: FolderKanban,
    },
    {
        group: 'workspace',
        order: 50,
        title: 'Cycles',
        href: cycles(workspace),
        icon: IterationCw,
    },
    {
        group: 'manage',
        order: 10,
        title: 'Labels',
        href: labels(workspace),
        icon: Tags,
    },
]) satisfies WorkspaceNav;
