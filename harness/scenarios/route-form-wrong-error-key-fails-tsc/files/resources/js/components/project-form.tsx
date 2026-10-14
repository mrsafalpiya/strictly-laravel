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
    });

    return <p>{form.errors['tasks.0.titel']}</p>;
}
