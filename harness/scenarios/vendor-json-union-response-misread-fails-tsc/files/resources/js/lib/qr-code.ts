import { useRouteHttp } from '@mrsafalpiya/strictly-laravel/react';
import { qrCode } from '@/routes/two-factor';

export function useQrCodeSvg(): () => Promise<string | null> {
    const http = useRouteHttp(qrCode());

    return async () => {
        const result = await http.submit();

        return result.ok ? result.response.svg : null;
    };
}
