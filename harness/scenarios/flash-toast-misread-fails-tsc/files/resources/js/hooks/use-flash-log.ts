import { router } from '@inertiajs/react';
import { useEffect } from 'react';

export function useFlashLog(): void {
    useEffect(() => {
        return router.on('flash', (event) => {
            const { toast } = event.detail.flash;

            if (toast) {
                console.info(toast.mesage);
            }
        });
    }, []);
}
