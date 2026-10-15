import { usePage } from '@inertiajs/react';

export function UserGreeting() {
    const { auth } = usePage().props;

    return <p>Hello, {auth.user!.name}</p>;
}
