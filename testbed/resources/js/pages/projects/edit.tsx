import { Head, Link } from '@inertiajs/react';
import { Field } from '@/components/field';
import { OpenIssueCounts } from '@/components/projects/open-issue-counts';
import { ProjectFields } from '@/components/projects/project-fields';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useWorkspace } from '@/hooks/use-workspace';
import { index, update } from '@/routes/projects';
import type { PageProps } from '@/generated';
import { t } from '@/generated/translations';
import { useRouteForm } from '@mrsafalpiya/strictly-laravel/react';

export default function ProjectsEdit({
    project,
    defaults,
    options,
}: PageProps<'projects/edit'>) {
    const workspace = useWorkspace();
    const form = useRouteForm(update({ workspace, project }), defaults);

    return (
        <>
            <Head title={t('projects.edit.head', { key: project.key })} />
            <form
                className="mx-auto flex w-full max-w-2xl flex-col gap-5 p-4"
                onSubmit={(event) => {
                    event.preventDefault();
                    form.submit();
                }}
            >
                <div className="flex items-center gap-2">
                    <h1 className="text-xl font-semibold">
                        {t('projects.edit.title', { name: project.name })}
                    </h1>
                    {project.archivedAt !== null && (
                        <Badge variant="secondary">
                            {t('projects.edit.archived')}
                        </Badge>
                    )}
                </div>

                <OpenIssueCounts counts={project.openIssueCounts} />

                {/* Not part of UpdateProjectData: the server prohibits changing the key. */}
                <Field label={t('projects.fields.key')} htmlFor="key">
                    <Input
                        id="key"
                        value={project.key}
                        readOnly
                        disabled
                        className="w-40 font-mono"
                    />
                </Field>

                <ProjectFields
                    data={form.data}
                    errors={form.errors}
                    setData={form.setData}
                    members={options.members}
                />

                <div className="flex justify-end gap-2">
                    <Button asChild variant="ghost">
                        <Link href={index(workspace)}>
                            {t('projects.edit.cancel')}
                        </Link>
                    </Button>
                    <Button type="submit" disabled={form.processing}>
                        {t('projects.edit.submit')}
                    </Button>
                </div>
            </form>
        </>
    );
}
