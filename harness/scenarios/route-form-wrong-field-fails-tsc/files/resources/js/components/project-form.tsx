import { useRouteForm } from '@mrsafalpiya/strictly-laravel/react';
import { store } from '@/actions/App/Http/Controllers/ProjectController';

export default function ProjectForm() {
    const form = useRouteForm(store(), {
        name: '',
        description: null,
        estimate: 1,
        tags: [],
        settings: { notifyOnAssign: true },
        tasks: [],
        archived: false,
    });

    return <input value={form.data.name} onChange={(event) => form.setData('name', event.target.value)} />;
}
