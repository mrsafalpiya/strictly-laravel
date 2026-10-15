import { useEcho } from '@laravel/echo-react';
import { useState } from 'react';
import type { ProjectData } from '@/generated';

export function ProjectTitle({ project }: { project: ProjectData }) {
    const [name, setName] = useState(project.name);

    // Any event name, and a payload type written by hand.
    useEcho(
        `projects.${project.id}`,
        'ProjectUpdated',
        (updated: { name: string }) => setName(updated.name),
    );

    return <h1>{name}</h1>;
}
