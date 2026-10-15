import { CommentItem } from '@/components/comments/comment-item';
import {
    issueRoute,
    reloadOptions,
} from '@/components/comments/comment-routes';
import type {
    CommentedIssue,
    CommentReload,
} from '@/components/comments/comment-routes';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useWorkspace } from '@/hooks/use-workspace';
import { store } from '@/routes/comments';
import type { CommentData } from '@/generated';
import { useRouteForm } from '@mrsafalpiya/strictly-laravel/react';

/**
 * An issue's comments and the new-comment form. The issue page sends `comments` as a deferred prop and passes the
 * props to reload after a change: `reload={{ only: page.only('comments', 'activity') }}` (a comment is also an
 * activity entry).
 */
export function CommentThread({
    issue,
    comments,
    canComment,
    reload,
}: {
    issue: CommentedIssue;
    comments: CommentData[];
    canComment: boolean;
    reload: CommentReload;
}) {
    const workspace = useWorkspace();
    const form = useRouteForm(store(issueRoute(workspace, issue)), {
        body: '',
    });

    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        form.submit({
            ...reloadOptions(reload),
            onSuccess: () => form.reset(),
        });
    };

    return (
        <div className="flex flex-col gap-5">
            {comments.length === 0 && (
                <p className="text-sm text-muted-foreground">
                    No comments yet.
                </p>
            )}
            {comments.map((comment) => (
                <CommentItem
                    key={comment.id}
                    issue={issue}
                    comment={comment}
                    canReact={canComment}
                    reload={reload}
                />
            ))}

            {canComment && (
                <form onSubmit={submit} className="flex flex-col gap-2">
                    <Textarea
                        value={form.data.body}
                        onChange={(event) =>
                            form.setData('body', event.target.value)
                        }
                        onKeyDown={(event) => {
                            if (
                                event.key === 'Enter' &&
                                (event.metaKey || event.ctrlKey)
                            ) {
                                submit(event);
                            }
                        }}
                        placeholder="Leave a comment…"
                        rows={3}
                        maxLength={10_000}
                        aria-label="New comment"
                        aria-invalid={form.errors.body !== undefined}
                    />
                    <InputError message={form.errors.body} />
                    <div>
                        <Button
                            type="submit"
                            size="sm"
                            disabled={
                                form.processing || form.data.body.trim() === ''
                            }
                        >
                            Comment
                        </Button>
                    </div>
                </form>
            )}
        </div>
    );
}
