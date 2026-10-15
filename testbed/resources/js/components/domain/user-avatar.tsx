import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import { cn } from '@/lib/utils';
import type { UserSummaryData } from '@/generated';

export function UserAvatar({
    user,
    className,
}: {
    user: UserSummaryData | null;
    className?: string;
}) {
    const getInitials = useInitials();

    return (
        <Avatar
            className={cn('size-6', className)}
            title={user?.name ?? 'Unassigned'}
        >
            <AvatarFallback className="text-[10px]">
                {user === null ? '?' : getInitials(user.name)}
            </AvatarFallback>
        </Avatar>
    );
}
