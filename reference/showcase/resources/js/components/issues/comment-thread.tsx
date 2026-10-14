import { CommentItem } from '@/components/comments/comment-item';
import {
    issueRoute,
    reloadComments,
} from '@/components/comments/comment-routes';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useWorkspace } from '@/hooks/use-workspace';
import { store } from '@/routes/comments';
import type { CommentData, IssueData } from '@/types';
import { forPage } from '@/lib/page';
import { useRouteForm } from '@/lib/requests';

const page = forPage<'issues/show'>();

/** The issue's comments (the deferred `comments` prop, already loaded) and the new-comment form. */
export function CommentThread({
    issue,
    comments,
    canComment,
}: {
    issue: IssueData;
    comments: CommentData[];
    canComment: boolean;
}) {
    const workspace = useWorkspace();
    const form = useRouteForm(store(issueRoute(workspace, issue)), {
        body: '',
    });

    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        form.submit({
            ...reloadComments,
            // A new comment is also an activity entry.
            only: page.only(...reloadComments.only, 'activity'),
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
