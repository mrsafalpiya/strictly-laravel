import { usePage } from '@inertiajs/react';
import { LayoutGrid, LifeBuoy } from 'lucide-react';
import { NavFooter } from '@/components/nav-footer';
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
    const shared = usePage().props;
    const { workspace } = shared;
    const nav = workspace === null ? null : workspaceNav(workspace, shared);
    // Where users get help, per deployment; .env.example lists it, so it is typed (and set in every build).
    const supportUrl = import.meta.env.VITE_TRACKLANE_SUPPORT_URL;

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
                {supportUrl !== '' && (
                    <NavFooter
                        items={[
                            {
                                title: 'Support',
                                href: supportUrl,
                                icon: LifeBuoy,
                            },
                        ]}
                    />
                )}
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
