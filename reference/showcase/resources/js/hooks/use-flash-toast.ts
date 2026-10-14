import { useEffect } from 'react';
import { toast } from 'sonner';
import { onRouterEvent } from '@/lib/requests';

export function useFlashToast(): void {
    useEffect(() => {
        return onRouterEvent('flash', (event) => {
            // Typed by App\Data\FlashData (InertiaConfig['flashDataType']).
            const { toast: data } = event.detail.flash;

            if (!data) {
                return;
            }

            toast[data.type](data.message);
        });
    }, []);
}
