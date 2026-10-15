import { Settings, Users } from 'lucide-react';
import type { WorkspaceNav } from '@/navigation';
import { index as members } from '@/routes/members';
import { edit as settings } from '@/routes/workspace/settings';

export default ((workspace) => [
    {
        group: 'manage',
        order: 20,
        title: 'Members',
        href: members(workspace),
        icon: Users,
    },
    ...(workspace.can.manage
        ? [
              {
                  group: 'manage' as const,
                  order: 30,
                  title: 'Settings',
                  href: settings(workspace),
                  icon: Settings,
              },
          ]
        : []),
]) satisfies WorkspaceNav;
