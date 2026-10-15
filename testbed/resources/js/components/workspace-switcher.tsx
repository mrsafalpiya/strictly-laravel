import { Link, usePage } from '@inertiajs/react';
import { Check, ChevronsUpDown, Plus } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { workspaceRoles } from '@/lib/domain';
import { dashboard } from '@/routes/workspace';
import { create } from '@/routes/workspaces';

export function WorkspaceSwitcher() {
    const { workspace, workspaces } = usePage().props;

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton size="lg">
                            <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-sidebar-primary text-sm font-semibold text-sidebar-primary-foreground">
                                {(workspace?.name ?? 'T').charAt(0)}
                            </div>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-semibold">
                                    {workspace?.name ?? 'Tracklane'}
                                </span>
                                <span className="truncate text-xs text-muted-foreground">
                                    {workspace
                                        ? workspaceRoles[workspace.role]
                                        : 'Choose a workspace'}
                                </span>
                            </div>
                            <ChevronsUpDown className="ml-auto size-4" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-60" align="start">
                        <DropdownMenuLabel className="text-xs text-muted-foreground">
                            Workspaces
                        </DropdownMenuLabel>
                        {workspaces.map((item) => (
                            <DropdownMenuItem key={item.id} asChild>
                                <Link href={dashboard(item)}>
                                    <span className="flex-1 truncate">
                                        {item.name}
                                    </span>
                                    {item.id === workspace?.id && (
                                        <Check className="size-4" />
                                    )}
                                </Link>
                            </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href={create()}>
                                <Plus className="size-4" /> New workspace
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
