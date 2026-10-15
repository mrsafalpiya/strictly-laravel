import { Bell } from 'lucide-react';
import type { WorkspaceNav } from '@/navigation';
import { index as notifications } from '@/routes/notifications';

export default ((workspace, { unreadNotifications }) => [
    {
        group: 'workspace',
        order: 70,
        title:
            unreadNotifications > 0
                ? `Inbox (${unreadNotifications})`
                : 'Inbox',
        href: notifications(workspace),
        icon: Bell,
    },
]) satisfies WorkspaceNav;
