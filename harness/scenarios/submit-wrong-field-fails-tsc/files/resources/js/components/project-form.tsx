import { submit } from '@mrsafalpiya/strictly-laravel/react';
import { store } from '@/actions/App/Http/Controllers/ProjectController';

export default function QuickProject() {
    const create = () =>
        submit(store(), {
            name: 'Launch',
            description: null,
            estimate: 3,
            tags: [],
            settings: { notifyOnAssign: true },
            tasks: [{ name: 'Kick-off' }],
        });

    return (
        <button type="button" onClick={create}>
            Create
        </button>
    );
}
