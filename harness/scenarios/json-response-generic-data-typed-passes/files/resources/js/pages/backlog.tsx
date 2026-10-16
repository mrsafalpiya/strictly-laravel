import { Head } from '@inertiajs/react';
import { useRouteHttp } from '@mrsafalpiya/strictly-laravel/react';
import { useState } from 'react';
import { show } from '@/actions/App/Http/Controllers/BacklogController';

export default function Backlog() {
    const backlog = useRouteHttp(show());
    const [first, setFirst] = useState('');

    const load = async () => {
        const result = await backlog.submit();

        if (result.ok) {
            setFirst(result.response.items[0]?.title ?? '');
        }
    };

    return (
        <>
            <Head title="Backlog" />
            <button type="button" onClick={() => void load()}>
                Load
            </button>
            <p>{first}</p>
        </>
    );
}
