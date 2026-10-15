import { useState } from 'react';
import type { ProjectData } from '@/generated';
import { channel, useChannelEvent } from '@/generated/broadcasting';

export function ProjectTitle({ project }: { project: ProjectData }) {
    const [name, setName] = useState(project.name);

    // The channel binds the project by its id, so the slug names a channel no project is broadcast on.
    useChannelEvent(
        channel('projects.{project}', { project: project.slug }),
        'ProjectUpdated',
        (updated) => setName(updated.name),
    );

    return <h1>{name}</h1>;
}
