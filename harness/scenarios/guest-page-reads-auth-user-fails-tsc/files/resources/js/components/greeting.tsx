import { usePage } from '@inertiajs/react';

// Rendered on the welcome page, which guests see too.
export function Greeting() {
    const { auth } = usePage().props;

    return <p>Welcome back, {auth.user.name}</p>;
}
