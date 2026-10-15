import { Head } from '@inertiajs/react';
import { Field } from '@/components/field';
import { ProjectFields } from '@/components/projects/project-fields';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useWorkspace } from '@/hooks/use-workspace';
import { store } from '@/routes/projects';
import type { PageProps } from '@/generated';
import { t } from '@/generated/translations';
import { useRouteForm } from '@mrsafalpiya/strictly-laravel/react';

export default function ProjectsCreate({
    defaults,
    options,
}: PageProps<'projects/create'>) {
    const workspace = useWorkspace();
    const form = useRouteForm(store(workspace), defaults);

    return (
        <>
            <Head title={t('projects.create.title')} />
            <form
                className="mx-auto flex w-full max-w-2xl flex-col gap-5 p-4"
                onSubmit={(event) => {
                    event.preventDefault();
                    form.submit();
                }}
            >
                <h1 className="text-xl font-semibold">
                    {t('projects.create.title')}
                </h1>

                <Field
                    label={t('projects.fields.key')}
                    htmlFor="key"
                    error={form.errors.key}
                >
                    <Input
                        id="key"
                        value={form.data.key}
                        maxLength={10}
                        autoFocus
                        className="w-40 font-mono uppercase"
                        onChange={(event) =>
                            form.setData(
                                'key',
                                event.target.value
                                    .toUpperCase()
                                    .replace(/[^A-Z]/g, ''),
                            )
                        }
                    />
                    <p className="text-xs text-muted-foreground">
                        {t('projects.create.key_hint', {
                            example: `${form.data.key || 'KEY'}-1`,
                        })}
                    </p>
                </Field>

                <ProjectFields
                    data={form.data}
                    errors={form.errors}
                    setData={form.setData}
                    members={options.members}
                />

                <div className="flex justify-end">
                    <Button type="submit" disabled={form.processing}>
                        {t('projects.create.submit')}
                    </Button>
                </div>
            </form>
        </>
    );
}
