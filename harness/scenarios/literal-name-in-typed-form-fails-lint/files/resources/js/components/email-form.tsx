import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { TypedForm } from '@mrsafalpiya/strictly-laravel/react';
import { update } from '@/routes/profile';

export default function EmailForm() {
    return (
        <TypedForm {...update.form()}>
            {({ field }) => (
                <>
                    <input name={field('name')} />
                    <CheckboxPrimitive.Root name="email" />
                </>
            )}
        </TypedForm>
    );
}
