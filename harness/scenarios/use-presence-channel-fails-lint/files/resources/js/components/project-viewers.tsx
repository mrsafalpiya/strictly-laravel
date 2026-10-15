import { usePresenceChannel } from '@laravel/echo-react';
import { useEffect, useState } from 'react';

type Viewer = { id: number; name: string };

export function ProjectViewers({ projectId }: { projectId: number }) {
    const [viewers, setViewers] = useState<Viewer[]>([]);
    const { channel } = usePresenceChannel(`projects.${projectId}.viewers`);

    // The members' data, typed by hand.
    useEffect(() => {
        channel()?.here((members: Viewer[]) => setViewers(members));
    }, [channel]);

    return <p>{viewers.map((viewer) => viewer.name).join(', ')}</p>;
}
