import { useState } from 'react';
import type { ProjectData } from '@/generated';
import { channel, useChannelEvent } from '@/generated/broadcasting';

export function ProjectTitle({ project }: { project: ProjectData }) {
    const [name, setName] = useState(project.name);

    // Misspelled: Echo would listen for an event the app never broadcasts.
    useChannelEvent(
        channel('projects.{project}', { project }),
        'ProjectUpdatd',
        (updated) => setName(updated.name),
    );

    return <h1>{name}</h1>;
}
