import { Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import type { LengthAwarePaginator } from '@/types';

/** Renders Laravel paginator links (`PaginatedDataCollection` props). */
export function Pagination({
    paginator,
}: {
    paginator: LengthAwarePaginator<number, unknown>;
}) {
    const { meta, links } = paginator;

    if (meta.last_page <= 1) {
        return null;
    }

    return (
        <nav
            className="flex items-center justify-between gap-4 text-sm"
            aria-label="Pagination"
        >
            <p className="text-muted-foreground">
                {meta.from}–{meta.to} of {meta.total}
            </p>
            <div className="flex gap-1">
                {links.map((link) =>
                    link.url === null ? (
                        <span
                            key={link.label}
                            className="rounded-md px-2.5 py-1 text-muted-foreground/50"
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ) : (
                        <Link
                            key={link.label}
                            href={link.url}
                            preserveScroll
                            className={cn(
                                'rounded-md px-2.5 py-1 hover:bg-accent',
                                link.active && 'bg-accent font-medium',
                            )}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ),
                )}
            </div>
        </nav>
    );
}
