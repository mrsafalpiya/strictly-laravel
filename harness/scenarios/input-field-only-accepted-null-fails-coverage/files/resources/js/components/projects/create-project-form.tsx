import { TypedForm } from '@mrsafalpiya/strictly-laravel/react';
import { store } from '@/actions/App/Http/Controllers/ProjectController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function CreateProjectForm() {
    return (
        <TypedForm {...store.form()} resetOnSuccess>
            {({ errors, field, processing }) => (
                <>
                    <Input name={field('name')} placeholder="Name" />
                    <InputError message={errors.name} />
                    <textarea name={field('description')} />
                    <InputError message={errors.description} />
                    <Button disabled={processing}>Create project</Button>
                </>
            )}
        </TypedForm>
    );
}
