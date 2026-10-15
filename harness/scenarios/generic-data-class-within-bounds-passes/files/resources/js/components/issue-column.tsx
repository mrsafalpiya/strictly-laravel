import type { BoardData, IssueData, ListingData } from '@/generated';

// Generic over the column's item type, which the bound lets it read as an issue.
export function IssueColumn<TItem extends IssueData>({
    listing,
}: {
    listing: ListingData<TItem>;
}) {
    return (
        <ul>
            {listing.items.map((issue) => (
                <li key={issue.id}>{issue.title}</li>
            ))}
        </ul>
    );
}

export function Board({ board }: { board: BoardData }) {
    return (
        <>
            <IssueColumn listing={board.backlog} />
            <p>{board.assignees.keys.length} assignees</p>
        </>
    );
}
