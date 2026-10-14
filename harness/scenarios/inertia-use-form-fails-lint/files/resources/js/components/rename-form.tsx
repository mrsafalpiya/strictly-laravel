import { useForm } from '@inertiajs/react';
import { update } from '@/actions/App/Http/Controllers/Settings/ProfileController';

export default function RenameForm() {
    const form = useForm({ name: '' });

    return (
        <button type="button" onClick={() => form.submit(update())}>
            {form.data.name}
        </button>
    );
}
