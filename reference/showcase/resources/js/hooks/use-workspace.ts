import { usePage } from '@inertiajs/react';
import type { CurrentWorkspaceData } from '@/types';

/**
 * The workspace in the URL. Only valid on pages under /w/{workspace}/...
 * (`workspace` is `CurrentWorkspaceData | null` in the shared props).
 */
export function useWorkspace(): CurrentWorkspaceData {
    const { workspace } = usePage().props;

    if (workspace === null) {
        throw new Error('useWorkspace() was called outside a workspace page.');
    }

    return workspace;
}
