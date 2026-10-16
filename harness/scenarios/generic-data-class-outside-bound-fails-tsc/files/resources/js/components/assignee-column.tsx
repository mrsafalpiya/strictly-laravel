import type { ListingData, UserData } from '@/generated';

// A column of users, as if the listing could hold anything.
export function AssigneeColumn({ listing }: { listing: ListingData<UserData> }) {
    return (
        <ul>
            {listing.items.map((user) => (
                <li key={user.id}>{user.name}</li>
            ))}
        </ul>
    );
}
