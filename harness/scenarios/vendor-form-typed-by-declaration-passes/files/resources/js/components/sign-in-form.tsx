import { TypedForm } from '@mrsafalpiya/strictly-laravel/react';
import { store } from '@/routes/login';

export default function SignInForm() {
    return (
        <TypedForm {...store.form()} resetOnSuccess={['password']}>
            {({ errors, field }) => (
                <>
                    <input type="email" name={field('email')} />
                    {errors.email && <p>{errors.email}</p>}
                    <input type="password" name={field('password')} />
                    <input type="checkbox" name={field('remember')} />
                    <button type="submit">Log in</button>
                </>
            )}
        </TypedForm>
    );
}
