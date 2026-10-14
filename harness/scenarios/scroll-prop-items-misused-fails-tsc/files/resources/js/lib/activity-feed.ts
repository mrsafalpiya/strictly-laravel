import type { ActivityFeedData } from '@/generated';

export function ids(feed: ActivityFeedData): number[] {
    return feed.activities.data.map((activity) => activity.title);
}
