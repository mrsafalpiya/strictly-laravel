import { useState } from 'react';
import type { ProjectData } from '@/generated';
import { channel, useChannelEvent } from '@/generated/broadcasting';

export function ProjectEvents({ project }: { project: ProjectData }) {
    const [log, setLog] = useState<string[]>([]);
    const projectChannel = channel('projects.{project}', { project });
    const add = (line: string) => setLog((lines) => [...lines, line]);

    // App\Events\ProjectUpdated, as Echo names it.
    useChannelEvent(projectChannel, 'ProjectUpdated', (updated) =>
        add(`Now ${updated.name}`),
    );
    // App\Events\Projects\ProjectArchived.
    useChannelEvent(projectChannel, 'Projects.ProjectArchived', (archived) =>
        add(`${archived.name} was archived`),
    );
    // Broadcast as `project.renamed`.
    useChannelEvent(projectChannel, '.project.renamed', (renamed) =>
        add(`${renamed.previousName} is now ${renamed.name}`),
    );

    return (
        <ul>
            {log.map((line) => (
                <li key={line}>{line}</li>
            ))}
        </ul>
    );
}
