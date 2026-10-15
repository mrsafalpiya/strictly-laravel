import { Form } from '@inertiajs/react';
import { update } from '@/routes/profile';

export default function RenameForm() {
    return (
        <Form {...update.form()}>{({ errors }) => <p>{errors.name}</p>}</Form>
    );
}
