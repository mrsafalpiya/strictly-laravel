import { useRouteHttp } from '@mrsafalpiya/strictly-laravel/react';
import { useState } from 'react';
import { recent } from '@/actions/App/Http/Controllers/ProjectController';

export default function RecentProjects() {
    const http = useRouteHttp(recent());
    const [names, setNames] = useState<string[]>([]);

    const load = async () => {
        const result = await http.submit();

        if (result.ok) {
            setNames(result.response.projects.map((project) => project.name));
        }
    };

    return (
        <div>
            <button type="button" onClick={() => void load()}>
                Recent projects
            </button>
            <ul>
                {names.map((name) => (
                    <li key={name}>{name}</li>
                ))}
            </ul>
        </div>
    );
}
