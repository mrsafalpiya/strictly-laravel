import { echo, useChannel } from '@laravel/echo-react';
import { useEffect, useState } from 'react';

export function TypingIndicator({
    issueId,
    name,
}: {
    issueId: number;
    name: string;
}) {
    const [typing, setTyping] = useState<string | null>(null);
    const { channel, leaveChannel } = useChannel(`issues.${issueId}`);

    useEffect(() => {
        channel()?.listenForWhisper('typing', (whisper: { name: string }) =>
            setTyping(whisper.name),
        );

        return () => {
            channel()?.stopListeningForWhisper('typing');
            leaveChannel();
        };
    }, [channel, leaveChannel]);

    const announce = () => {
        echo().private(`issues.${issueId}`).whisper('typing', { name });
    };

    return (
        <p onKeyDown={announce} data-socket={echo().socketId()}>
            {typing === null ? null : `${typing} is typing…`}
        </p>
    );
}
