import { submit, useRouteForm, visit } from '@mrsafalpiya/strictly-laravel/react';
import type { FormEvent } from 'react';
import { destroy, index, store } from '@/actions/App/Http/Controllers/ProjectController';

export default function ProjectForm({ projectId }: { projectId: number }) {
    const form = useRouteForm(store(), {
        name: '',
        description: null,
        estimate: 1,
        tags: [],
        settings: { notifyOnAssign: true },
        tasks: [],
    });

    const save = (event: FormEvent) => {
        event.preventDefault();
        form.submit({
            preserveScroll: true,
            onError: (errors) => form.setData('name', errors['tasks.0.title'] ?? ''),
        });
    };

    const duplicate = () =>
        submit(
            store(),
            { ...form.data, tags: ['copy'], tasks: [{ title: 'Kick-off' }] },
            { onError: (errors) => form.setData('name', errors['settings.notifyOnAssign'] ?? '') },
        );

    return (
        <form onSubmit={save}>
            <input value={form.data.name} onChange={(event) => form.setData('name', event.target.value)} />
            {form.errors.name && <p>{form.errors.name}</p>}
            {form.errors['tags.0'] && <p>{form.errors['tags.0']}</p>}
            {form.errors['settings.notifyOnAssign'] && <p>{form.errors['settings.notifyOnAssign']}</p>}
            {form.errors['tasks.0.title'] && <p>{form.errors['tasks.0.title']}</p>}
            <button type="button" onClick={duplicate}>
                Duplicate
            </button>
            <button type="button" onClick={() => visit(destroy(projectId), { preserveScroll: true })}>
                Delete
            </button>
            <button type="button" onClick={() => visit(index())}>
                All projects
            </button>
        </form>
    );
}
