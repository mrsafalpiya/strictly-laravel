import { submit } from '@mrsafalpiya/strictly-laravel/react';
import { store as login } from '@/routes/login';
import { store as register } from '@/routes/register';

export function signIn(email: string, password: string): void {
    submit(login(), { email, password, remember: true });
}

export function signUp(name: string, email: string, password: string): void {
    submit(register(), {
        name,
        email,
        password,
        password_confirmation: password,
        remember: true,
    });
}
