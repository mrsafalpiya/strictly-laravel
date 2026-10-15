import { usePage } from '@inertiajs/react';
import { Bell, FolderKanban, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { StatusIcon } from '@/components/domain/status-icon';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { show as board } from '@/routes/board';
import { index as notificationsIndex } from '@/routes/notifications';
import type {
    CurrentWorkspaceData,
    IssueReferenceData,
    ProjectSummaryData,
} from '@/generated';
import { useSearch } from './use-search';
import { visit } from '@mrsafalpiya/strictly-laravel/react';

type Item =
    | { kind: 'issue'; issue: IssueReferenceData }
    | { kind: 'project'; project: ProjectSummaryData }
    | { kind: 'notifications'; unread: number };

function key(item: Item): string {
    switch (item.kind) {
        case 'issue':
            return `issue-${item.issue.id}`;
        case 'project':
            return `project-${item.project.id}`;
        case 'notifications':
            return 'notifications';
        default:
            return item satisfies never;
    }
}

/** Cmd/Ctrl+K anywhere inside a workspace. Mounted once by the sidebar layout. */
export function CommandPalette() {
    const { workspace } = usePage().props;

    return workspace === null ? null : <Palette workspace={workspace} />;
}

function Palette({ workspace }: { workspace: CurrentWorkspaceData }) {
    const { unreadNotifications } = usePage().props;
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [active, setActive] = useState(0);
    const { run, results, processing } = useSearch(workspace);

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (
                event.key.toLowerCase() === 'k' &&
                (event.metaKey || event.ctrlKey)
            ) {
                event.preventDefault();
                setOpen((value) => !value);
            }
        };

        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, []);

    const searching = query.trim() !== '';
    const items: Item[] = searching
        ? [
              ...(results?.issues ?? []).map((issue): Item => ({
                  kind: 'issue',
                  issue,
              })),
              ...(results?.projects ?? []).map((project): Item => ({
                  kind: 'project',
                  project,
              })),
          ]
        : [{ kind: 'notifications', unread: unreadNotifications }];

    const go = (item: Item) => {
        setOpen(false);

        // Until the Issues area has issue pages, an issue or a project opens the board of its project.
        switch (item.kind) {
            case 'issue':
                return visit(
                    board(workspace, {
                        query: { project: item.issue.projectKey },
                    }),
                );
            case 'project':
                return visit(
                    board(workspace, { query: { project: item.project.key } }),
                );
            case 'notifications':
                return visit(notificationsIndex(workspace));
            default:
                return item satisfies never;
        }
    };

    const onOpenChange = (value: boolean) => {
        setOpen(value);
        if (!value) {
            setQuery('');
            setActive(0);
            run('');
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="top-[20%] translate-y-0 gap-0 overflow-hidden p-0 sm:max-w-xl">
                <DialogTitle className="sr-only">Search</DialogTitle>
                <DialogDescription className="sr-only">
                    Search issues and projects in {workspace.name}
                </DialogDescription>
                <div className="flex items-center gap-2 border-b px-3">
                    <Search className="size-4 shrink-0 text-muted-foreground" />
                    <input
                        autoFocus
                        value={query}
                        onChange={(event) => {
                            setQuery(event.target.value);
                            setActive(0);
                            run(event.target.value);
                        }}
                        onKeyDown={(event) => {
                            if (event.key === 'ArrowDown') {
                                event.preventDefault();
                                setActive((i) =>
                                    Math.min(i + 1, items.length - 1),
                                );
                            } else if (event.key === 'ArrowUp') {
                                event.preventDefault();
                                setActive((i) => Math.max(i - 1, 0));
                            } else if (event.key === 'Enter') {
                                const item = items[active];
                                if (item) go(item);
                            }
                        }}
                        placeholder="Search issues and projects… (try TRK-12)"
                        aria-label="Search"
                        className="h-12 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                    />
                </div>

                <ul
                    role="listbox"
                    aria-label="Results"
                    className="max-h-80 overflow-y-auto p-1"
                >
                    {items.map((item, i) => (
                        <li
                            key={key(item)}
                            role="option"
                            aria-selected={i === active}
                            onMouseEnter={() => setActive(i)}
                            onClick={() => go(item)}
                            className={cn(
                                'flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm',
                                i === active && 'bg-accent',
                            )}
                        >
                            <ItemLabel item={item} />
                        </li>
                    ))}
                </ul>

                {searching && (
                    <p className="border-t px-3 py-2 text-xs text-muted-foreground">
                        {processing
                            ? 'Searching…'
                            : items.length === 0 && results !== null
                              ? 'No results.'
                              : '↑↓ to move · Enter to open · Esc to close'}
                    </p>
                )}
            </DialogContent>
        </Dialog>
    );
}

function ItemLabel({ item }: { item: Item }) {
    switch (item.kind) {
        case 'issue':
            return (
                <>
                    <StatusIcon status={item.issue.status} />
                    <span className="font-mono text-xs text-muted-foreground">
                        {item.issue.identifier}
                    </span>
                    <span className="truncate">{item.issue.title}</span>
                </>
            );
        case 'project':
            return (
                <>
                    <FolderKanban className="size-4 text-muted-foreground" />
                    <span className="truncate">{item.project.name}</span>
                    <span className="ml-auto font-mono text-xs text-muted-foreground">
                        {item.project.key}
                    </span>
                </>
            );
        case 'notifications':
            return (
                <>
                    <Bell className="size-4 text-muted-foreground" />
                    <span>Notifications</span>
                    {item.unread > 0 && (
                        <span className="ml-auto rounded-full bg-primary px-1.5 text-xs text-primary-foreground tabular-nums">
                            {item.unread}
                        </span>
                    )}
                </>
            );
        default:
            return item satisfies never;
    }
}
