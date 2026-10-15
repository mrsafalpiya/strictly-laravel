import { useState } from 'react';
import type { ProjectData } from '@/generated';
import { channel, useChannelEvent } from '@/generated/broadcasting';

export function ProjectFeed({
    project,
    userId,
}: {
    project: ProjectData;
    userId: number;
}) {
    const [name, setName] = useState(project.name);
    const rename = (updated: ProjectData) => setName(updated.name);

    // A parameter bound to a model takes its Data object or its route key.
    useChannelEvent(
        channel('projects.{project}', { project }),
        'ProjectUpdated',
        rename,
    );
    useChannelEvent(
        channel('projects.{project}.viewers', { project: project.id }),
        'ProjectUpdated',
        rename,
    );
    // A plain parameter takes any value; a pattern without one takes none.
    useChannelEvent(
        channel('App.Models.User.{id}', { id: userId }),
        'ProjectUpdated',
        rename,
    );
    useChannelEvent(channel('announcements'), 'ProjectUpdated', rename);
    // A channel that is one of two takes an event sent on both.
    useChannelEvent(
        userId === project.id
            ? channel('announcements')
            : channel('projects.{project}', { project }),
        'ProjectUpdated',
        rename,
    );

    return <h1>{name}</h1>;
}
