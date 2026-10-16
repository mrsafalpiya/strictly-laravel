import { useState } from 'react';
import type { ProjectData, ViewerData } from '@/generated';
import { channel, usePresence } from '@/generated/broadcasting';

export function ProjectViewers({ project }: { project: ProjectData }) {
    const [viewers, setViewers] = useState<ViewerData[]>([]);
    const [editors, setEditors] = useState<string[]>([]);

    // A parameter bound to a model takes its Data object or its route key.
    usePresence(channel('projects.{project}.viewers', { project }), {
        here: (members) => setViewers(members),
        joining: (viewer) => setViewers((current) => [...current, viewer]),
        leaving: (viewer) =>
            setViewers((current) =>
                current.filter(({ id }) => id !== viewer.id),
            ),
    });
    // A channel class's join() types its members the same way.
    const { leave } = usePresence(
        channel('projects.{project}.editors', { project: project.id }),
        { here: (members) => setEditors(members.map(({ name }) => name)) },
    );

    return (
        <section>
            <p>{viewers.map(({ name }) => name).join(', ')}</p>
            <p>{editors.join(', ')}</p>
            <button type="button" onClick={leave}>
                Stop sharing
            </button>
        </section>
    );
}
