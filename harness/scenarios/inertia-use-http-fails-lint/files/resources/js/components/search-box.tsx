import { useHttp } from '@inertiajs/react';
import { useState } from 'react';
import { home } from '@/routes';

type SearchResults = { query: string; hits: { id: number; title: string }[] };

export default function SearchBox() {
    // Request and response types picked by hand: nothing ties them to the controller.
    const http = useHttp<{ q: string }, SearchResults>({ q: '' });
    const [query, setQuery] = useState('');

    const run = async () => {
        const results = await http.submit(home());
        setQuery(results.query);
    };

    return (
        <button type="button" onClick={() => void run()}>
            {query}
        </button>
    );
}
