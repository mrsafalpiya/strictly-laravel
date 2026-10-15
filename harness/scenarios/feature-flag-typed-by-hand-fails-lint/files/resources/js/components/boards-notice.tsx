import { usePage } from '@inertiajs/react';

export function BoardsNotice() {
    const { features } = usePage<{ features: { boards: boolean } }>().props;

    return features.boards ? <p>Boards are here.</p> : null;
}
