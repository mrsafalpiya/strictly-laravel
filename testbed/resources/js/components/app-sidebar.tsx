import { usePage } from '@inertiajs/react';
import { LayoutGrid } from 'lucide-react';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
} from '@/components/ui/sidebar';
import { WorkspaceSwitcher } from '@/components/workspace-switcher';
import { workspaceNav } from '@/navigation';
import { dashboard } from '@/routes';

export function AppSidebar() {
    const { workspace } = usePage().props;
    const nav = workspace === null ? null : workspaceNav(workspace);

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
                        <NavMain title="Workspace" items={nav.workspace} />
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
