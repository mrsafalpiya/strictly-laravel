import type { VisitOptions } from '@inertiajs/core';
import { Link } from '@inertiajs/react';
import type { ComponentProps } from 'react';
import { Bookmark, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWorkspace } from '@/hooks/use-workspace';
import { destroy, store } from '@/routes/views';
import type { IssueFiltersData, SavedViewData } from '@/generated';
import { submit, visit } from '@mrsafalpiya/strictly-laravel/react';

type SavedViewsProps = {
    /** The issue list's current filters: what "Save view" saves. */
    filters: IssueFiltersData;
    savedViews: SavedViewData[];
    /** The issue list with a view's filters applied. */
    href: (filters: IssueFiltersData) => ComponentProps<typeof Link>['href'];
    /** What to reload after a view is saved or deleted: the list page's `{ only: page.only('savedViews') }`. */
    reload: Pick<VisitOptions, 'only'>;
};

/** "Save view" for the issue list's current filters. */
export function SaveViewButton({
    filters,
    reload,
}: Pick<SavedViewsProps, 'filters' | 'reload'>) {
    const workspace = useWorkspace();

    // Saves the `filters` prop as-is: it is already typed as the nested IssueFiltersData SaveViewData takes.
    const save = () => {
        const name = prompt('Name this view')?.trim();

        if (!name) {
            return;
        }

        submit(
            store(workspace),
            { name, filters },
            {
                preserveScroll: true,
                preserveState: true,
                ...reload,
                onError: (errors) => alert(Object.values(errors).join('\n')),
            },
        );
    };

    return (
        <Button variant="outline" size="sm" onClick={save}>
            <Bookmark className="size-4" /> Save view
        </Button>
    );
}

/** The user's saved views of the issue list, each a link to its filters and a delete button. */
export function SavedViewList({
    savedViews,
    href,
    reload,
}: Omit<SavedViewsProps, 'filters'>) {
    const workspace = useWorkspace();

    if (savedViews.length === 0) {
        return null;
    }

    const remove = (view: SavedViewData) => {
        if (confirm(`Delete view “${view.name}”?`)) {
            visit(destroy({ workspace, savedView: view }), {
                preserveScroll: true,
                preserveState: true,
                ...reload,
            });
        }
    };

    return (
        <div className="flex flex-wrap gap-2 text-sm">
            <span className="text-muted-foreground">Views:</span>
            {savedViews.map((view) => (
                <span
                    key={view.id}
                    className="flex items-center rounded-md border"
                >
                    <Link
                        href={href(view.filters)}
                        className="rounded-l-md px-2 py-0.5 hover:bg-accent"
                    >
                        {view.name}
                    </Link>
                    <button
                        type="button"
                        aria-label={`Delete view ${view.name}`}
                        onClick={() => remove(view)}
                        className="rounded-r-md px-1 py-0.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                    >
                        <X className="size-3" />
                    </button>
                </span>
            ))}
        </div>
    );
}
