import type { ActivityFeedData } from '@/generated';

export function titles(feed: ActivityFeedData): string[] {
    return feed.activities.data.map((activity) => activity.title);
}

export function hasMore(feed: ActivityFeedData): boolean {
    return feed.activities.meta.next_page_url !== null;
}
