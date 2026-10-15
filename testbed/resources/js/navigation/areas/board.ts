import { Activity, KanbanSquare, LayoutGrid } from 'lucide-react';
import type { WorkspaceNav } from '@/navigation';
import { index as activity } from '@/routes/activity';
import { show as board } from '@/routes/board';
import { dashboard } from '@/routes/workspace';

export default ((workspace) => [
    {
        group: 'workspace',
        order: 10,
        title: 'Dashboard',
        href: dashboard(workspace),
        icon: LayoutGrid,
    },
    {
        group: 'workspace',
        order: 30,
        title: 'Board',
        href: board(workspace),
        icon: KanbanSquare,
    },
    {
        group: 'workspace',
        order: 60,
        title: 'Activity',
        href: activity(workspace),
        icon: Activity,
    },
]) satisfies WorkspaceNav;
