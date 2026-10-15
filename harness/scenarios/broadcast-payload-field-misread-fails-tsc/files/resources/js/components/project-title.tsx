import { useState } from 'react';
import type { ProjectData } from '@/generated';
import { channel, useChannelEvent } from '@/generated/broadcasting';

export function ProjectTitle({ project }: { project: ProjectData }) {
    const [name, setName] = useState(project.name);

    // The payload's type comes from the event's Data class, which has no `title`.
    useChannelEvent(
        channel('projects.{project}', { project }),
        'ProjectUpdated',
        (updated) => setName(updated.title),
    );

    return <h1>{name}</h1>;
}
