import { TypedForm } from '@mrsafalpiya/strictly-laravel/react';
import { store } from '@/actions/App/Http/Controllers/ProjectController';

export default function ProjectForm() {
    return (
        <TypedForm {...store.form()}>
            {({ errors, field }) => (
                <>
                    <input name={field('name')} />
                    {errors.nmae && <p>{errors.nmae}</p>}
                </>
            )}
        </TypedForm>
    );
}
