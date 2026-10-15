import { useRouteHttp } from '@mrsafalpiya/strictly-laravel/react';
import { useState } from 'react';
import { checkName } from '@/actions/App/Http/Controllers/ProjectController';
import InputError from '@/components/input-error';

export function ProjectNameField() {
    const http = useRouteHttp(checkName(), { name: '' });
    const [hint, setHint] = useState<string | null>(null);

    const check = async () => {
        const result = await http.submit();

        if (result.ok) {
            setHint(
                result.response.suggestion === null
                    ? null
                    : `Taken. Try "${result.response.suggestion}".`,
            );
        }
    };

    return (
        <div>
            <input
                value={http.data.name}
                onChange={(event) => http.setData('name', event.target.value)}
                onBlur={() => void check()}
            />
            <InputError message={http.errors.name} />
            {hint !== null && <p>{hint}</p>}
        </div>
    );
}
