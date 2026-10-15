import { router, usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import type { ToastType } from '@/generated';

export function useFlashLog(): void {
    useEffect(() => {
        return router.on('flash', (event) => {
            const { toast } = event.detail.flash;

            if (toast) {
                console.info(toast.message);
            }
        });
    }, []);
}

export function useToastType(): ToastType | null {
    return usePage().flash.toast?.type ?? null;
}
