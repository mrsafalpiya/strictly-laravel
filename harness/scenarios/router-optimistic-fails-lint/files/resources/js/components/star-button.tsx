import { router } from '@inertiajs/react';

type Starred = { stars: number };

export function StarButton() {
    return (
        <button
            type="button"
            onClick={() =>
                router
                    .optimistic<Starred>((props) => ({
                        stars: props.stars + 1,
                    }))
                    .reload()
            }
        >
            Star
        </button>
    );
}
