import { usePage } from '@inertiajs/react';
import { useUser } from '@/hooks/use-user';

// Rendered on the dashboard, which only signed-in users see.
export function DashboardGreeting() {
    const user = useUser();

    return <p>Welcome back, {user.name}</p>;
}

// Rendered on the welcome page, which guests see too.
export function WelcomeGreeting() {
    const { auth } = usePage().props;

    return <p>Welcome, {auth.user?.name ?? 'guest'}</p>;
}
