import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { workspaceRoles } from '@/lib/domain';
import type { WorkspaceRole } from '@/types';

/** A role picker limited to the roles the server says the viewer may hand out. */
export function RoleSelect({
    value,
    roles,
    onChange,
    disabled,
    id,
}: {
    value: WorkspaceRole;
    roles: WorkspaceRole[];
    onChange: (role: WorkspaceRole) => void;
    disabled?: boolean;
    id?: string;
}) {
    // The current value stays selectable even if the viewer couldn't assign it (e.g. an owner row).
    const options = roles.includes(value) ? roles : [value, ...roles];

    return (
        <Select
            value={value}
            disabled={disabled}
            onValueChange={(next) => {
                const role = options.find((option) => option === next);

                if (role !== undefined) {
                    onChange(role);
                }
            }}
        >
            <SelectTrigger id={id} className="w-32">
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                {options.map((role) => (
                    <SelectItem key={role} value={role}>
                        {workspaceRoles[role]}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
