import { useState } from 'react';
import type { ProjectData } from '@/generated';
import { publicChannel, useChannelEvent } from '@/generated/broadcasting';

export function ProjectStatus({ project }: { project: ProjectData }) {
    const [current, setCurrent] = useState(project);
    const [latest, setLatest] = useState('');

    // A public channel without parameters, and one whose parameter holds a model's route key (or its Data object).
    useChannelEvent(publicChannel('status'), 'ProjectUpdated', (updated) =>
        setLatest(updated.name),
    );
    useChannelEvent(
        publicChannel('projects.{project}.public', { project }),
        'ProjectUpdated',
        (updated) => setCurrent(updated),
    );
    useChannelEvent(
        publicChannel('projects.{project}.public', { project: project.id }),
        'ProjectUpdated',
        (updated) => setCurrent(updated),
    );

    return (
        <h1 title={current.description ?? latest}>
            {current.name.toUpperCase()}
        </h1>
    );
}
