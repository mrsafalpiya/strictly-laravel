import { Head, Link } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { ProjectCard } from '@/components/projects/project-card';
import { Button } from '@/components/ui/button';
import { useWorkspace } from '@/hooks/use-workspace';
import { create, index } from '@/routes/projects';
import type { PageProps } from '@/types';

export default function ProjectsIndex({
    projects,
    showArchived,
    archivedCount,
}: PageProps<'projects/index'>) {
    const workspace = useWorkspace();

    return (
        <>
            <Head title="Projects" />
            <div className="flex flex-col gap-4 p-4">
                <div className="flex items-center justify-between gap-2">
                    <h1 className="text-xl font-semibold">Projects</h1>
                    <div className="flex items-center gap-2">
                        {archivedCount > 0 && (
                            <Button asChild variant="outline" size="sm">
                                <Link
                                    href={index(workspace, {
                                        query: showArchived
                                            ? {}
                                            : { archived: true },
                                    })}
                                    preserveScroll
                                >
                                    {showArchived
                                        ? 'Hide archived'
                                        : `Show archived (${archivedCount})`}
                                </Link>
                            </Button>
                        )}
                        {workspace.can.manage && (
                            <Button asChild size="sm">
                                <Link href={create(workspace)}>
                                    <Plus className="size-4" /> New project
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>

                {projects.length === 0 ? (
                    <p className="rounded-lg border p-8 text-center text-sm text-muted-foreground">
                        No projects yet.
                    </p>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {projects.map((project) => (
                            <ProjectCard key={project.id} project={project} />
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
