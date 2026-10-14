import { Head, Link } from '@inertiajs/react';
import { formatDate } from '@/components/members/date';
import { Button } from '@/components/ui/button';
import { workspaceRoles } from '@/lib/domain';
import { accept } from '@/routes/invitations';
import { dashboard } from '@/routes/workspace';
import type { InvitationPreviewData, PageProps } from '@/types';
import { visit } from '@/lib/requests';

type Status = InvitationPreviewData['status'];

const problems = {
    expired: {
        title: 'This invitation has expired',
        body: 'Ask a workspace admin to send you a new one.',
    },
    accepted: {
        title: 'This invitation was already used',
        body: 'Each invitation link works once.',
    },
    wrong_email: {
        title: 'This invitation is for someone else',
        body: 'Log in with the invited email address to accept it.',
    },
} as const satisfies Record<
    Exclude<Status, 'pending' | 'already_member'>,
    { title: string; body: string }
>;

export default function InvitationsShow({
    invitation,
}: PageProps<'invitations/show'>) {
    const workspace = invitation.workspaceSlug;

    const body = (() => {
        switch (invitation.status) {
            case 'pending':
                return (
                    <Button
                        onClick={() => visit(accept(invitation))}
                        className="self-start"
                    >
                        Join {invitation.workspaceName}
                    </Button>
                );
            case 'already_member':
                return (
                    <p className="text-sm">
                        You're already a member.{' '}
                        <Link
                            href={dashboard(workspace)}
                            className="font-medium underline"
                        >
                            Open {invitation.workspaceName}
                        </Link>
                    </p>
                );
            case 'expired':
            case 'accepted':
            case 'wrong_email':
                return (
                    <div
                        role="alert"
                        className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
                    >
                        <p className="font-medium">
                            {problems[invitation.status].title}
                        </p>
                        <p>{problems[invitation.status].body}</p>
                    </div>
                );
            default:
                return invitation.status satisfies never;
        }
    })();

    return (
        <>
            <Head title={`Join ${invitation.workspaceName}`} />
            <div className="mx-auto flex w-full max-w-md flex-col gap-4 p-4 pt-12">
                <h1 className="text-xl font-semibold">
                    Join {invitation.workspaceName}
                </h1>
                <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
                    <dt className="text-muted-foreground">Invited by</dt>
                    <dd>{invitation.invitedBy.name}</dd>
                    <dt className="text-muted-foreground">Sent to</dt>
                    <dd>{invitation.email}</dd>
                    <dt className="text-muted-foreground">Role</dt>
                    <dd>{workspaceRoles[invitation.role]}</dd>
                    <dt className="text-muted-foreground">Expires</dt>
                    <dd>{formatDate(invitation.expiresAt)}</dd>
                </dl>
                {body}
            </div>
        </>
    );
}
