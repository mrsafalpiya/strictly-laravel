import { echo } from '@laravel/echo-react';
import { useEffect, useState } from 'react';

type Comment = { body: string };

export function CommentFeed({ issueId }: { issueId: number }) {
    const [comments, setComments] = useState<Comment[]>([]);

    // The event's payload, typed by hand.
    useEffect(() => {
        const issue = echo().private(`issues.${issueId}`);

        issue.listen('CommentPosted', (comment: Comment) =>
            setComments((current) => [...current, comment]),
        );

        return () => echo().leave(`issues.${issueId}`);
    }, [issueId]);

    return <p>{comments.map((comment) => comment.body).join(', ')}</p>;
}
