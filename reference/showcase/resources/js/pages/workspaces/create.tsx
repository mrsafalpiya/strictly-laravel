import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { Field } from '@/components/field';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { slugify } from '@/components/workspaces/slug';
import { store } from '@/routes/workspaces';
import type { PageProps } from '@/types';
import { useRouteForm } from '@/lib/requests';

export default function WorkspacesCreate({
    defaults,
}: PageProps<'workspaces/create'>) {
    const form = useRouteForm(store(), defaults);
    // The slug follows the name until the user edits it by hand.
    const [slugTouched, setSlugTouched] = useState(defaults.slug !== '');

    return (
        <>
            <Head title="New workspace" />
            <form
                className="mx-auto flex w-full max-w-lg flex-col gap-5 p-4"
                onSubmit={(event) => {
                    event.preventDefault();
                    form.submit();
                }}
            >
                <div>
                    <h1 className="text-xl font-semibold">New workspace</h1>
                    <p className="text-sm text-muted-foreground">
                        A workspace holds your projects, issues and team.
                    </p>
                </div>

                <Field label="Name" htmlFor="name" error={form.errors.name}>
                    <Input
                        id="name"
                        value={form.data.name}
                        autoFocus
                        onChange={(event) => {
                            const name = event.target.value;

                            form.setData((data) => ({
                                ...data,
                                name,
                                slug: slugTouched ? data.slug : slugify(name),
                            }));
                        }}
                    />
                </Field>

                <Field label="URL" htmlFor="slug" error={form.errors.slug}>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <span>/w/</span>
                        <Input
                            id="slug"
                            value={form.data.slug}
                            onChange={(event) => {
                                setSlugTouched(event.target.value !== '');
                                form.setData('slug', event.target.value);
                            }}
                        />
                    </div>
                </Field>

                <div className="flex justify-end">
                    <Button type="submit" disabled={form.processing}>
                        Create workspace
                    </Button>
                </div>
            </form>
        </>
    );
}
