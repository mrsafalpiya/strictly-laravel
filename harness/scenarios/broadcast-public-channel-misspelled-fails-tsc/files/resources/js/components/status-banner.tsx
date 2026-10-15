import { useState } from 'react';
import { publicChannel, useChannelEvent } from '@/generated/broadcasting';

export function StatusBanner() {
    const [name, setName] = useState('');

    // config/strictly.php declares the public channel status: nothing is broadcast on this one.
    useChannelEvent(publicChannel('statuss'), 'ProjectUpdated', (updated) =>
        setName(updated.name),
    );

    return <p>{name}</p>;
}
