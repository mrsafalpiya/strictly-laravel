import { Link } from '@inertiajs/react';
import { Archive, ArchiveRestore, Pencil, Trash2 } from 'lucide-react';
import { UserAvatar } from '@/components/domain/user-avatar';
import { OpenIssueCounts } from '@/components/projects/open-issue-counts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useWorkspace } from '@/hooks/use-workspace';
import { colors } from '@/lib/domain';
import { cn } from '@/lib/utils';
import { archive, destroy, edit } from '@/routes/projects';
import type { ProjectData } from '@/generated';
import { visit } from '@mrsafalpiya/strictly-laravel/react';

export function ProjectCard({ project }: { project: ProjectData }) {
    const workspace = useWorkspace();
    const route = { workspace, project };
    const archived = project.archivedAt !== null;

    return (
        <article
            className={cn(
                'flex flex-col gap-3 rounded-lg border p-4',
                archived && 'bg-muted/40',
            )}
        >
            <header className="flex items-start gap-3">
                <span
                    className={cn(
                        'mt-1 size-3 shrink-0 rounded-full',
                        colors[project.color],
                    )}
                />
                <div className="min-w-0 flex-1">
                    {/* The Issues area links the name to the project's issues. */}
                    <span className="font-medium">{project.name}</span>
                    <div className="font-mono text-xs text-muted-foreground">
                        {project.key} · {project.issuesCount} issues
                    </div>
                </div>
                {archived && <Badge variant="secondary">Archived</Badge>}
                <UserAvatar user={project.lead} />
            </header>

            {project.description !== null && (
                <p className="line-clamp-2 text-sm text-muted-foreground">
                    {project.description}
                </p>
            )}

            <OpenIssueCounts counts={project.openIssueCounts} />

            {workspace.can.manage && (
                <footer className="mt-auto flex flex-wrap items-center gap-1 border-t pt-3">
                    <Button asChild variant="ghost" size="sm">
                        <Link href={edit(route)}>
                            <Pencil className="size-3.5" /> Edit
                        </Link>
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                            visit(archive(route), { preserveScroll: true })
                        }
                    >
                        {archived ? (
                            <>
                                <ArchiveRestore className="size-3.5" /> Restore
                            </>
                        ) : (
                            <>
                                <Archive className="size-3.5" /> Archive
                            </>
                        )}
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="ml-auto text-destructive"
                        onClick={() =>
                            confirm(`Delete ${project.key}?`) &&
                            // A refusal (project still has issues) comes back as an error toast.
                            visit(destroy(route), {
                                preserveScroll: true,
                            })
                        }
                    >
                        <Trash2 className="size-3.5" /> Delete
                    </Button>
                </footer>
            )}
        </article>
    );
}
