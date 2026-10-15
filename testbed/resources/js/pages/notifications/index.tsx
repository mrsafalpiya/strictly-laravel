import { Head, usePage } from '@inertiajs/react';
import { CheckCheck } from 'lucide-react';
import { NotificationItem } from '@/components/notifications/notification-item';
import { Button } from '@/components/ui/button';
import { useWorkspace } from '@/hooks/use-workspace';
import { cn } from '@/lib/utils';
import { readAll } from '@/routes/notifications';
import type { PageProps } from '@/generated';
import { Pagination, visit } from '@mrsafalpiya/strictly-laravel/react';

export default function NotificationsIndex({
    notifications,
}: PageProps<'notifications/index'>) {
    const workspace = useWorkspace();
    const { unreadNotifications } = usePage().props;

    return (
        <>
            <Head title="Notifications" />
            <div className="flex flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold">
                        Notifications
                        {unreadNotifications > 0 && (
                            <span className="ml-2 text-sm font-normal text-muted-foreground">
                                {unreadNotifications} unread
                            </span>
                        )}
                    </h1>
                    {unreadNotifications > 0 && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                                visit(readAll(workspace), {
                                    preserveScroll: true,
                                })
                            }
                        >
                            <CheckCheck className="size-4" /> Mark all as read
                        </Button>
                    )}
                </div>

                {notifications.data.length === 0 ? (
                    <p className="rounded-lg border p-8 text-center text-sm text-muted-foreground">
                        You’re all caught up.
                    </p>
                ) : (
                    <ul className="divide-y rounded-lg border">
                        {notifications.data.map((notification) => (
                            <NotificationItem
                                key={notification.id}
                                notification={notification}
                            />
                        ))}
                    </ul>
                )}

                <Pagination
                    paginator={notifications}
                    className="flex justify-end gap-1 text-sm"
                    linkClassName={(link) =>
                        cn(
                            'rounded-md px-2.5 py-1',
                            link.url === null
                                ? 'text-muted-foreground/50'
                                : 'hover:bg-accent',
                            link.active && 'bg-accent font-medium',
                        )
                    }
                />
            </div>
        </>
    );
}
