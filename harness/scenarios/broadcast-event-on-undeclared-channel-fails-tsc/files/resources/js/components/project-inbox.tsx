import { useState } from 'react';
import { channel, useChannelEvent } from '@/generated/broadcasting';

export function ProjectInbox({ userId }: { userId: number }) {
    const [names, setNames] = useState<string[]>([]);

    // ProjectUpdated goes to the project's channel, never to the user's: this callback would never run.
    useChannelEvent(
        channel('App.Models.User.{id}', { id: userId }),
        'ProjectUpdated',
        (updated) => setNames((current) => [...current, updated.name]),
    );

    return (
        <ul>
            {names.map((name) => (
                <li key={name}>{name}</li>
            ))}
        </ul>
    );
}
