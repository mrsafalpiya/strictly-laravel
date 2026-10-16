import { useChannel } from '@laravel/echo-react';
import { useState } from 'react';

type Comment = { body: string };

export function CommentFeed({ userId }: { userId: number }) {
    const [comments, setComments] = useState<Comment[]>([]);

    // A misspelt event name and a payload typed by hand.
    useChannel(`App.Models.User.${userId}`)
        .channel()
        ?.listen('CommentPostd', (comment: Comment) =>
            setComments((current) => [...current, comment]),
        );

    return <p>{comments.map((comment) => comment.body).join(', ')}</p>;
}
