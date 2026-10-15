import { useRouteHttp } from '@mrsafalpiya/strictly-laravel/react';
import { useState } from 'react';
import { confirmation } from '@/routes/password';

export default function PasswordConfirmationStatus() {
    const status = useRouteHttp(confirmation());
    const [confirmed, setConfirmed] = useState(false);

    const check = async () => {
        const result = await status.submit();

        if (result.ok) {
            setConfirmed(result.response.isConfirmed);
        }
    };

    return (
        <button type="button" onClick={() => void check()}>
            {confirmed ? 'Confirmed' : 'Check'}
        </button>
    );
}
