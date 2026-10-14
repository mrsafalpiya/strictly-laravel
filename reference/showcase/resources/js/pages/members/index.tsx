import { Head } from '@inertiajs/react';
import { InvitationList } from '@/components/members/invitation-list';
import { InviteForm } from '@/components/members/invite-form';
import { MemberRow } from '@/components/members/member-row';
import { useWorkspace } from '@/hooks/use-workspace';
import type { PageProps } from '@/types';

export default function MembersIndex({
    members,
    invitations,
    inviteDefaults,
    can,
}: PageProps<'members/index'>) {
    const workspace = useWorkspace();

    return (
        <>
            <Head title="Members" />
            <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 p-4">
                <section className="flex flex-col gap-3">
                    <h1 className="text-xl font-semibold">
                        Members{' '}
                        <span className="text-muted-foreground">
                            {members.length}
                        </span>
                    </h1>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b text-xs text-muted-foreground uppercase">
                                <tr>
                                    <th className="py-2 pr-4 font-medium">
                                        Name
                                    </th>
                                    <th className="py-2 pr-4 font-medium">
                                        Email
                                    </th>
                                    <th className="py-2 pr-4 font-medium">
                                        Role
                                    </th>
                                    <th className="py-2 pr-4 font-medium">
                                        Joined
                                    </th>
                                    <th className="py-2">
                                        <span className="sr-only">Actions</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {members.map((member) => (
                                    <MemberRow
                                        key={member.id}
                                        workspace={workspace}
                                        member={member}
                                        assignableRoles={can.assignableRoles}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                {invitations !== null && (
                    <section className="flex flex-col gap-4">
                        <h2 className="text-lg font-semibold">Invitations</h2>
                        {can.invite && (
                            <InviteForm
                                workspace={workspace}
                                defaults={inviteDefaults}
                                roles={can.assignableRoles}
                            />
                        )}
                        <InvitationList
                            workspace={workspace}
                            invitations={invitations}
                        />
                    </section>
                )}
            </div>
        </>
    );
}
