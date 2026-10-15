import { useState } from 'react';
import type { UserData } from '@/generated';
import { channel, useChannelEvent } from '@/generated/broadcasting';

export function InvoiceAlerts({ user }: { user: UserData }) {
    const [title, setTitle] = useState<string | null>(null);

    // The app event broadcast alongside the notification, typed by its Data class.
    useChannelEvent(
        channel('App.Models.User.{id}', { id: user.id }),
        'InvoicePaid',
        (paid) => setTitle(paid.title),
    );

    return title === null ? null : <p>{title}</p>;
}
