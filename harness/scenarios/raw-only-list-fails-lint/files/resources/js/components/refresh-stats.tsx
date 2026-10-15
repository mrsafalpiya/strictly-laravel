import { router } from '@inertiajs/react';

export function RefreshStats() {
    return (
        <button
            type="button"
            onClick={() => router.reload({ only: ['stats'] })}
        >
            Refresh
        </button>
    );
}
