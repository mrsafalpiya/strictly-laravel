import { usePage } from '@inertiajs/react';

export function UserAvatar() {
    const { auth } = usePage().props;

    if (auth.user === null) {
        return null;
    }

    return <img src={auth.user.avatar} alt={auth.user.name} />;
}
