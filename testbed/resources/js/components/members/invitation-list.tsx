import { formatDate } from '@/components/members/date';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { workspaceRoles } from '@/lib/domain';
import { destroy } from '@/routes/invitations';
import type { CurrentWorkspaceData, InvitationData } from '@/generated';
import { forPage } from '@mrsafalpiya/strictly-laravel/react';
import { visit } from '@mrsafalpiya/strictly-laravel/react';

const page = forPage<'members/index'>();

export function InvitationList({
    workspace,
    invitations,
}: {
    workspace: CurrentWorkspaceData;
    invitations: InvitationData[];
}) {
    if (invitations.length === 0) {
        return (
            <p className="text-sm text-muted-foreground">
                No pending invitations.
            </p>
        );
    }

    return (
        <ul className="divide-y rounded-lg border">
            {invitations.map((invitation) => (
                <li
                    key={invitation.id}
                    className="flex items-center gap-3 px-3 py-2 text-sm"
                >
                    <span className="font-medium">{invitation.email}</span>
                    <Badge variant="outline">
                        {workspaceRoles[invitation.role]}
                    </Badge>
                    <span className="text-muted-foreground">
                        by {invitation.invitedBy.name} ·{' '}
                        {invitation.expired
                            ? 'expired'
                            : `expires ${formatDate(invitation.expiresAt)}`}
                    </span>
                    {invitation.expired && (
                        <Badge variant="destructive">Expired</Badge>
                    )}
                    <Button
                        variant="ghost"
                        size="sm"
                        className="ml-auto"
                        onClick={() =>
                            visit(destroy({ workspace, invitation }), {
                                preserveScroll: true,
                                only: page.only('invitations'),
                            })
                        }
                    >
                        Revoke
                    </Button>
                </li>
            ))}
        </ul>
    );
}
