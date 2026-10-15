import { Head, Link } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { ProjectCard } from '@/components/projects/project-card';
import { Button } from '@/components/ui/button';
import { useWorkspace } from '@/hooks/use-workspace';
import { create, index } from '@/routes/projects';
import type { PageProps } from '@/generated';
import { t } from '@/generated/translations';

export default function ProjectsIndex({
    projects,
    showArchived,
    archivedCount,
}: PageProps<'projects/index'>) {
    const workspace = useWorkspace();

    return (
        <>
            <Head title={t('projects.index.title')} />
            <div className="flex flex-col gap-4 p-4">
                <div className="flex items-center justify-between gap-2">
                    <h1 className="text-xl font-semibold">
                        {t('projects.index.title')}
                    </h1>
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
                                        ? t('projects.index.hide_archived')
                                        : t('projects.index.show_archived', {
                                              count: archivedCount,
                                          })}
                                </Link>
                            </Button>
                        )}
                        {workspace.can.manage && (
                            <Button asChild size="sm">
                                <Link href={create(workspace)}>
                                    <Plus className="size-4" />{' '}
                                    {t('projects.index.new')}
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>

                {projects.length === 0 ? (
                    <p className="rounded-lg border p-8 text-center text-sm text-muted-foreground">
                        {t('projects.index.empty')}
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
