import { useState } from 'react';
import type { ProjectData } from '@/generated';
import { publicChannel, useChannelEvent } from '@/generated/broadcasting';

export function ProjectStatus({ project }: { project: ProjectData }) {
    const [current, setCurrent] = useState(project);

    // config/strictly.php declares projects.{project}.public: nothing is broadcast on this one.
    useChannelEvent(
        publicChannel('project.{project}.public', { project }),
        'ProjectUpdated',
        (updated) => setCurrent(updated),
    );

    return <h1>{current.name}</h1>;
}
