import { useState } from 'react';
import { publicChannel, useChannelEvent } from '@/generated/broadcasting';

export function StatusBanner() {
    const [name, setName] = useState('');

    useChannelEvent(publicChannel('status'), 'ProjectUpdated', (updated) =>
        setName(updated.name),
    );

    return <p>{name}</p>;
}
