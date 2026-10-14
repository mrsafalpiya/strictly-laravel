import { useRouteHttp } from '@mrsafalpiya/strictly-laravel/react';
import { useState } from 'react';
import {
    health,
    search,
    stats,
} from '@/actions/App/Http/Controllers/SearchController';

export default function SearchBox() {
    const http = useRouteHttp(search(), { q: '' });
    const totals = useRouteHttp(stats());
    const status = useRouteHttp(health());
    const [titles, setTitles] = useState<string[]>([]);
    const [indexed, setIndexed] = useState(0);
    const [healthy, setHealthy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const run = async () => {
        const result = await http.submit();

        if (result.ok) {
            setTitles(result.response.hits.map((hit) => hit.title));
        } else {
            setError(result.errors.q ?? null);
        }
    };

    const count = async () => {
        const result = await totals.submit();

        if (result.ok) {
            setIndexed(result.response.indexed);
        }
    };

    const check = async () => {
        const result = await status.submit();

        // No declared response: the result is `unknown` until it is checked.
        setHealthy(
            result.ok &&
                typeof result.response === 'object' &&
                result.response !== null &&
                'status' in result.response,
        );
    };

    return (
        <div>
            <input
                value={http.data.q}
                onChange={(event) => http.setData('q', event.target.value)}
            />
            {http.errors.q && <p>{http.errors.q}</p>}
            {error && <p>{error}</p>}
            <button type="button" onClick={() => void run()}>
                Search
            </button>
            <button type="button" onClick={() => void count()}>
                {indexed}
            </button>
            <button type="button" onClick={() => void check()}>
                {healthy ? 'Healthy' : 'Check'}
            </button>
            <ul>
                {titles.map((title) => (
                    <li key={title}>{title}</li>
                ))}
            </ul>
            {http.response && <p>{http.response.query}</p>}
        </div>
    );
}
