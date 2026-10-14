import { usePage } from '@inertiajs/react';
import {
    Activity,
    Bell,
    CircleDot,
    FolderKanban,
    IterationCw,
    KanbanSquare,
    LayoutGrid,
    Settings,
    Tags,
    Users,
} from 'lucide-react';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
} from '@/components/ui/sidebar';
import { WorkspaceSwitcher } from '@/components/workspace-switcher';
import { dashboard } from '@/routes';
import { index as activity } from '@/routes/activity';
import { show as board } from '@/routes/board';
import { index as cycles } from '@/routes/cycles';
import { index as issues } from '@/routes/issues';
import { index as labels } from '@/routes/labels';
import { index as members } from '@/routes/members';
import { index as notifications } from '@/routes/notifications';
import { index as projects } from '@/routes/projects';
import { dashboard as workspaceDashboard } from '@/routes/workspace';
import { edit as workspaceSettings } from '@/routes/workspace/settings';
import type { CurrentWorkspaceData, NavItem } from '@/types';

function workspaceNav(
    workspace: CurrentWorkspaceData,
    unread: number,
): { main: NavItem[]; manage: NavItem[] } {
    return {
        main: [
            {
                title: 'Dashboard',
                href: workspaceDashboard(workspace),
                icon: LayoutGrid,
            },
            { title: 'Issues', href: issues(workspace), icon: CircleDot },
            { title: 'Board', href: board(workspace), icon: KanbanSquare },
            {
                title: 'Projects',
                href: projects(workspace),
                icon: FolderKanban,
            },
            { title: 'Cycles', href: cycles(workspace), icon: IterationCw },
            { title: 'Activity', href: activity(workspace), icon: Activity },
            {
                title: unread > 0 ? `Inbox (${unread})` : 'Inbox',
                href: notifications(workspace),
                icon: Bell,
            },
        ],
        manage: [
            { title: 'Labels', href: labels(workspace), icon: Tags },
            { title: 'Members', href: members(workspace), icon: Users },
            ...(workspace.can.manage
                ? [
                      {
                          title: 'Settings',
                          href: workspaceSettings(workspace),
                          icon: Settings,
                      },
                  ]
                : []),
        ],
    };
}

export function AppSidebar() {
    const { workspace, unreadNotifications } = usePage().props;
    const nav =
        workspace === null
            ? null
            : workspaceNav(workspace, unreadNotifications);

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <WorkspaceSwitcher />
            </SidebarHeader>

            <SidebarContent>
                {nav === null ? (
                    <NavMain
                        title="Platform"
                        items={[
                            {
                                title: 'Dashboard',
                                href: dashboard(),
                                icon: LayoutGrid,
                            },
                        ]}
                    />
                ) : (
                    <>
                        <NavMain title="Workspace" items={nav.main} />
                        <NavMain title="Manage" items={nav.manage} />
                    </>
                )}
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
