import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { UserAvatar } from '@/components/domain/user-avatar';
import InputError from '@/components/input-error';
import { formatDate } from '@/components/members/date';
import { RoleSelect } from '@/components/members/role-select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { workspaceRoles } from '@/lib/domain';
import { destroy, update } from '@/routes/members';
import type {
    CurrentWorkspaceData,
    MemberData,
    WorkspaceRole,
} from '@/generated';
import { forPage } from '@mrsafalpiya/strictly-laravel/react';
import { submit, visit } from '@mrsafalpiya/strictly-laravel/react';

const page = forPage<'members/index'>();

const reload = {
    preserveScroll: true,
    only: page.only('members', 'can'),
};

export function MemberRow({
    workspace,
    member,
    assignableRoles,
}: {
    workspace: CurrentWorkspaceData;
    member: MemberData;
    assignableRoles: WorkspaceRole[];
}) {
    const [error, setError] = useState<string | undefined>();
    const route = { workspace, membership: member };

    const changeRole = (role: WorkspaceRole) => {
        submit(
            update(route),
            { role },
            {
                ...reload,
                onSuccess: () => setError(undefined),
                // Errors are keyed by UpdateMemberData's fields (`errors.rol` fails to compile).
                onError: (errors) => setError(errors.role),
            },
        );
    };

    const remove = () => {
        if (
            window.confirm(`Remove ${member.user.name} from ${workspace.name}?`)
        ) {
            visit(destroy(route), reload);
        }
    };

    return (
        <tr className="border-b last:border-0">
            <td className="py-2 pr-4">
                <div className="flex items-center gap-2">
                    <UserAvatar user={member.user} />
                    <span className="font-medium">{member.user.name}</span>
                    {member.isViewer && <Badge variant="secondary">You</Badge>}
                </div>
            </td>
            <td className="py-2 pr-4 text-muted-foreground">{member.email}</td>
            <td className="py-2 pr-4">
                {member.can.updateRole ? (
                    <>
                        <RoleSelect
                            value={member.role}
                            roles={assignableRoles}
                            onChange={changeRole}
                        />
                        <InputError message={error} />
                    </>
                ) : (
                    <Badge variant="outline">
                        {workspaceRoles[member.role]}
                    </Badge>
                )}
            </td>
            <td className="py-2 pr-4 text-muted-foreground">
                {formatDate(member.joinedAt)}
            </td>
            <td className="py-2 text-right">
                {member.can.remove && (
                    <Button
                        variant="ghost"
                        size="icon"
                        title={`Remove ${member.user.name}`}
                        onClick={remove}
                    >
                        <Trash2 />
                    </Button>
                )}
            </td>
        </tr>
    );
}
