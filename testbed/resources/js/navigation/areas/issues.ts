import { CircleDot } from 'lucide-react';
import type { WorkspaceNav } from '@/navigation';
import { index as issues } from '@/routes/issues';

export default ((workspace) => [
    {
        group: 'workspace',
        order: 20,
        title: 'Issues',
        href: issues(workspace),
        icon: CircleDot,
    },
]) satisfies WorkspaceNav;
