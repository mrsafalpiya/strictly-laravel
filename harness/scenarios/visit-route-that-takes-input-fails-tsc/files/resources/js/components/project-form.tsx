import { visit } from '@mrsafalpiya/strictly-laravel/react';
import { store } from '@/actions/App/Http/Controllers/ProjectController';

export default function QuickProject() {
    return (
        <button type="button" onClick={() => visit(store())}>
            Create
        </button>
    );
}
