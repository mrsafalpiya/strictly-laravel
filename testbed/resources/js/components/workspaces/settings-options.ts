import { enumValues } from '@/generated';
import { allOf } from '@/lib/domain';
import type { IssueView, WorkspaceSettingsData } from '@/generated';

// Labels for the settings pickers. `satisfies Record<…>` keeps them in step with the PHP types.
// (IssueView would belong in lib/domain.ts, which this feature area doesn't own.)
export const issueViews = {
    list: 'List',
    board: 'Board',
} as const satisfies Record<IssueView, string>;

export const weekStarts = {
    monday: 'Monday',
    sunday: 'Sunday',
} as const satisfies Record<WorkspaceSettingsData['weekStartsOn'], string>;

export const issueViewValues = enumValues.IssueView;
export const weekStartValues = allOf<WorkspaceSettingsData['weekStartsOn']>()(
    'monday',
    'sunday',
);

export const notificationSettings = {
    onAssign: {
        label: 'Assignments',
        description: 'Notify people when an issue is assigned to them.',
    },
    onComment: {
        label: 'Comments',
        description: 'Notify participants when someone comments.',
    },
    dailyDigest: {
        label: 'Daily digest',
        description: 'Send a summary of yesterday’s activity every morning.',
    },
} as const satisfies Record<
    keyof WorkspaceSettingsData['notifications'],
    { label: string; description: string }
>;

export const notificationSettingKeys = allOf<
    keyof WorkspaceSettingsData['notifications']
>()('onAssign', 'onComment', 'dailyDigest');
