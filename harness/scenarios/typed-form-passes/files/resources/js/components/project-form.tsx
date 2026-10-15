import { TypedForm } from '@mrsafalpiya/strictly-laravel/react';
import type { FieldName } from '@mrsafalpiya/strictly-laravel/react';
import {
    destroy,
    store,
} from '@/actions/App/Http/Controllers/ProjectController';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';

function Field({ label, name }: { label: string; name: FieldName }) {
    return (
        <label>
            {label}
            <input name={name} />
        </label>
    );
}

export default function ProjectForm({ projectId }: { projectId: number }) {
    return (
        <>
            <TypedForm
                {...store.form()}
                resetOnSuccess={['name', 'tasks.0.title']}
                options={{ preserveScroll: true }}
                onError={(errors) => errors['settings.notifyOnAssign']}
                className="space-y-6"
            >
                {({ errors, field, processing }) => (
                    <>
                        <Input name={field('name')} />
                        {errors.name && <p>{errors.name}</p>}
                        <textarea name={field('description')} />
                        <select name={field('estimate')}>
                            <option value="1">1</option>
                        </select>
                        <Field label="Tag" name={field('tags.0')} />
                        <Checkbox name={field('settings.notifyOnAssign')} />
                        <Field
                            label="First task"
                            name={field('tasks.0.title')}
                        />
                        {errors['tasks.0.title'] && (
                            <p>{errors['tasks.0.title']}</p>
                        )}
                        <Button disabled={processing}>Create</Button>
                    </>
                )}
            </TypedForm>
            <TypedForm {...destroy.form(projectId)}>
                {({ processing }) => (
                    <button type="submit" disabled={processing}>
                        Delete
                    </button>
                )}
            </TypedForm>
        </>
    );
}
