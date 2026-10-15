import { SmilePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useWorkspace } from '@/hooks/use-workspace';
import { cn } from '@/lib/utils';
import { react } from '@/routes/comments';
import type { CommentData, Reaction } from '@/generated';
import { issueRoute, reloadOptions } from './comment-routes';
import type { CommentedIssue, CommentReload } from './comment-routes';
import { reactions, reactionValues } from './reactions';
import { submit } from '@mrsafalpiya/strictly-laravel/react';

export function ReactionBar({
    issue,
    comment,
    canReact,
    reload,
}: {
    issue: CommentedIssue;
    comment: CommentData;
    canReact: boolean;
    reload: CommentReload;
}) {
    const workspace = useWorkspace();

    const toggle = (emoji: Reaction) => {
        submit(
            react({ ...issueRoute(workspace, issue), comment }),
            { emoji },
            reloadOptions(reload),
        );
    };

    return (
        <div className="flex flex-wrap items-center gap-1">
            {comment.reactions.map((reaction) => (
                <button
                    key={reaction.emoji}
                    type="button"
                    disabled={!canReact}
                    onClick={() => toggle(reaction.emoji)}
                    aria-pressed={reaction.reacted}
                    aria-label={`${reactions[reaction.emoji]}: ${reaction.count}`}
                    className={cn(
                        'flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs',
                        reaction.reacted
                            ? 'border-primary/50 bg-primary/10'
                            : 'hover:bg-accent',
                    )}
                >
                    <span>{reaction.emoji}</span>
                    <span className="tabular-nums">{reaction.count}</span>
                </button>
            ))}
            {canReact && (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="size-6"
                            aria-label="Add reaction"
                        >
                            <SmilePlus className="size-3.5" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="flex min-w-0 gap-0.5 p-1">
                        {reactionValues.map((emoji) => (
                            <DropdownMenuItem
                                key={emoji}
                                onSelect={() => toggle(emoji)}
                                aria-label={reactions[emoji]}
                                className="px-1.5 text-base"
                            >
                                {emoji}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            )}
        </div>
    );
}
