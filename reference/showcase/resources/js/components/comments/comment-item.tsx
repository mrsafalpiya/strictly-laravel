import { Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { UserAvatar } from '@/components/domain/user-avatar';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useWorkspace } from '@/hooks/use-workspace';
import { destroy, update } from '@/routes/comments';
import type { CommentData, IssueData } from '@/types';
import { issueRoute, reloadComments } from './comment-routes';
import { ReactionBar } from './reaction-bar';
import { useRouteForm } from '@/lib/requests';
import { visit } from '@/lib/requests';

export function CommentItem({
    issue,
    comment,
    canReact,
}: {
    issue: IssueData;
    comment: CommentData;
    canReact: boolean;
}) {
    const workspace = useWorkspace();
    const route = { ...issueRoute(workspace, issue), comment };
    const [editing, setEditing] = useState(false);
    const form = useRouteForm(update(route), { body: comment.body });

    const save = (event: React.FormEvent) => {
        event.preventDefault();
        form.submit({
            ...reloadComments,
            onSuccess: () => setEditing(false),
        });
    };

    const remove = () => {
        if (confirm('Delete this comment?')) {
            visit(destroy(route), reloadComments);
        }
    };

    return (
        <article className="group flex gap-3 text-sm">
            <UserAvatar user={comment.author} className="mt-0.5" />
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <header className="flex items-center gap-2">
                    <span className="font-medium">{comment.author.name}</span>
                    <time
                        dateTime={comment.createdAt}
                        className="text-xs text-muted-foreground"
                    >
                        {new Date(comment.createdAt).toLocaleString()}
                    </time>
                    {comment.editedAt !== null && (
                        <span
                            className="text-xs text-muted-foreground"
                            title={new Date(comment.editedAt).toLocaleString()}
                        >
                            (edited)
                        </span>
                    )}
                    <div className="ml-auto flex gap-1 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
                        {comment.can.update && !editing && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="size-6"
                                aria-label="Edit comment"
                                onClick={() => {
                                    form.setData('body', comment.body);
                                    setEditing(true);
                                }}
                            >
                                <Pencil className="size-3.5" />
                            </Button>
                        )}
                        {comment.can.delete && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="size-6"
                                aria-label="Delete comment"
                                onClick={remove}
                            >
                                <Trash2 className="size-3.5" />
                            </Button>
                        )}
                    </div>
                </header>

                {editing ? (
                    <form onSubmit={save} className="flex flex-col gap-2">
                        <Textarea
                            value={form.data.body}
                            onChange={(event) =>
                                form.setData('body', event.target.value)
                            }
                            rows={3}
                            maxLength={10_000}
                            autoFocus
                            aria-invalid={form.errors.body !== undefined}
                        />
                        <InputError message={form.errors.body} />
                        <div className="flex gap-2">
                            <Button
                                type="submit"
                                size="sm"
                                disabled={form.processing}
                            >
                                Save
                            </Button>
                            <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                    form.clearErrors();
                                    setEditing(false);
                                }}
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                ) : (
                    <p className="break-words whitespace-pre-wrap">
                        {comment.body}
                    </p>
                )}

                <ReactionBar
                    issue={issue}
                    comment={comment}
                    canReact={canReact}
                />
            </div>
        </article>
    );
}
