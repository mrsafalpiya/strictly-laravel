import { useState } from 'react';
import type { ProjectData } from '@/generated';
import { channel, usePresence } from '@/generated/broadcasting';

export function ProjectViewers({ project }: { project: ProjectData }) {
    const [emails, setEmails] = useState<string[]>([]);

    // The members' type comes from the channel callback's Data class, which has no `email`.
    usePresence(channel('projects.{project}.viewers', { project }), {
        here: (viewers) => setEmails(viewers.map((viewer) => viewer.email)),
    });

    return <p>{emails.join(', ')}</p>;
}
