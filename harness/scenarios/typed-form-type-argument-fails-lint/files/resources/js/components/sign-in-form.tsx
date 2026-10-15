import { TypedForm } from '@mrsafalpiya/strictly-laravel/react';
import type { LoginData } from '@/generated';
import { store } from '@/routes/login';

export default function SignInForm() {
    return (
        <TypedForm<LoginData> {...store.form()}>
            {({ field }) => (
                <>
                    <input type="email" name={field('email')} />
                    <input type="password" name={field('password')} />
                    <button type="submit">Log in</button>
                </>
            )}
        </TypedForm>
    );
}
