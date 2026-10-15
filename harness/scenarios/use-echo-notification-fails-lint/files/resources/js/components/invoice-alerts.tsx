import { useEchoNotification } from '@laravel/echo-react';
import { useState } from 'react';
import type { UserData } from '@/generated';

export function InvoiceAlerts({ user }: { user: UserData }) {
    const [title, setTitle] = useState<string | null>(null);

    // The notification's toBroadcast() payload, typed by hand.
    useEchoNotification(
        `App.Models.User.${user.id}`,
        (notification: { title: string }) => setTitle(notification.title),
    );

    return title === null ? null : <p>{title}</p>;
}
