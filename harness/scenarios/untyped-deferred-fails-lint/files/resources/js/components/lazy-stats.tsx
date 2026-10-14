import { Deferred } from '@inertiajs/react';
import type { ReactNode } from 'react';

export function LazyStats({ children }: { children: ReactNode }) {
    return (
        <Deferred data="stats" fallback={<p>Loading…</p>}>
            {children}
        </Deferred>
    );
}
