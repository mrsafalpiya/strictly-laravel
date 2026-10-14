import { usePage } from '@inertiajs/react';
import type { UserData } from '@/types';

/**
 * The authenticated user, for pages behind the `auth` middleware.
 * `auth.user` is `UserData | null` in the shared props because guest pages exist too.
 */
export function useUser(): UserData {
    const { user } = usePage().props.auth;

    if (user === null) {
        throw new Error(
            'useUser() was called on a page that is visible to guests.',
        );
    }

    return user;
}
