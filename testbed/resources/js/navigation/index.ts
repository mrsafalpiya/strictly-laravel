import type { CurrentWorkspaceData, SharedProps } from '@/generated';
import type { NavItem } from '@/types';

/** A sidebar entry inside a workspace: its group, and its position in that group (lowest first). */
export type WorkspaceNavItem = NavItem & {
    group: 'workspace' | 'manage';
    order: number;
};

/** What one Tracklane area adds to the sidebar of a workspace, given the shared props (features, unread count). */
export type WorkspaceNav = (
    workspace: CurrentWorkspaceData,
    shared: SharedProps,
) => WorkspaceNavItem[];

/*
 * Each area owns one module in ./areas, so adding an area adds a file instead of editing a shared list:
 *
 *     export default ((workspace) => [{ group: 'workspace', order: 20, title: 'Issues', href: index(workspace), icon: CircleDot }]) satisfies WorkspaceNav;
 *
 * Orders in use: workspace group Dashboard 10, Issues 20, Board 30, Projects 40, Cycles 50, Activity 60, Inbox 70;
 * manage group Labels 10, Members 20, Settings 30.
 */
const areas = import.meta.glob<{ default: WorkspaceNav }>('./areas/*.ts', {
    eager: true,
});

/** The sidebar of a workspace, by group. */
export function workspaceNav(
    workspace: CurrentWorkspaceData,
    shared: SharedProps,
): Record<WorkspaceNavItem['group'], NavItem[]> {
    const items = Object.values(areas)
        .flatMap((area) => area.default(workspace, shared))
        .sort((a, b) => a.order - b.order);

    return {
        workspace: items.filter((item) => item.group === 'workspace'),
        manage: items.filter((item) => item.group === 'manage'),
    };
}
