import { Field } from '@/components/field';
import { RoleSelect } from '@/components/members/role-select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { store } from '@/routes/invitations';
import type {
    CurrentWorkspaceData,
    StoreInvitationData,
    WorkspaceRole,
} from '@/generated';
import { useRouteForm } from '@mrsafalpiya/strictly-laravel/react';

export function InviteForm({
    workspace,
    defaults,
    roles,
}: {
    workspace: CurrentWorkspaceData;
    defaults: StoreInvitationData;
    roles: WorkspaceRole[];
}) {
    const form = useRouteForm(store(workspace), defaults);

    return (
        <form
            className="flex flex-wrap items-start gap-3"
            onSubmit={(event) => {
                event.preventDefault();
                form.submit({
                    preserveScroll: true,
                    onSuccess: () => form.reset('email'),
                });
            }}
        >
            <div className="min-w-64 flex-1">
                <Field
                    label="Email"
                    htmlFor="invite-email"
                    error={form.errors.email}
                >
                    <Input
                        id="invite-email"
                        type="email"
                        placeholder="teammate@example.com"
                        value={form.data.email}
                        onChange={(event) =>
                            form.setData('email', event.target.value)
                        }
                    />
                </Field>
            </div>
            <Field label="Role" htmlFor="invite-role" error={form.errors.role}>
                <RoleSelect
                    id="invite-role"
                    value={form.data.role}
                    roles={roles}
                    onChange={(role) => form.setData('role', role)}
                />
            </Field>
            <Button type="submit" className="mt-6" disabled={form.processing}>
                Send invite
            </Button>
        </form>
    );
}
