import { TypedForm } from '@mrsafalpiya/strictly-laravel/react';
import { store } from '@/routes/login';

export default function SignInForm() {
    return (
        <TypedForm {...store.form()}>
            {({ field }) => (
                <>
                    <input type="text" name={field('username')} />
                    <input type="password" name={field('password')} />
                    <button type="submit">Log in</button>
                </>
            )}
        </TypedForm>
    );
}
