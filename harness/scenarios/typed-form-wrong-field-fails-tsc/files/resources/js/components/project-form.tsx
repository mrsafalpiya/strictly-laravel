import { TypedForm } from '@mrsafalpiya/strictly-laravel/react';
import { store } from '@/actions/App/Http/Controllers/ProjectController';

export default function ProjectForm() {
    return (
        <TypedForm {...store.form()}>
            {({ field }) => <input name={field('nmae')} />}
        </TypedForm>
    );
}
