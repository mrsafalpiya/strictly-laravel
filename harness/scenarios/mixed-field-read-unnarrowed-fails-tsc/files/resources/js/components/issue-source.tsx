import type { IssueData } from '@/generated';

export default function IssueSource({ issue }: { issue: IssueData }) {
    // Read as if meta were always an object with a source.
    const source: string = issue.meta.source;

    return (
        <p>
            {issue.title} (from {source})
        </p>
    );
}
