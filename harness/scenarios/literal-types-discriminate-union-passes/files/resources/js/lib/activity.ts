import type { CommentedActivityData, PreferencesData, StatusChangedActivityData } from '@/generated';

type Activity = CommentedActivityData | StatusChangedActivityData;

/** Narrowed by the enum case each Data class declares; the default branch proves the switch is exhaustive. */
export function describeActivity(activity: Activity): string {
    switch (activity.type) {
        case 'commented':
            return activity.body;
        case 'status_changed':
            return `${activity.from} → ${activity.to}`;
        default:
            return activity satisfies never;
    }
}

export const defaults: PreferencesData = { weekStartsOn: 'monday', pageSize: 25, notificationsAcknowledged: true };
