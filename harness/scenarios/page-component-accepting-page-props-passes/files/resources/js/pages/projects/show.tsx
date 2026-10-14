import type { PageProps } from '@/generated';

export default function Show({ title, openIssues }: PageProps<'projects/show'>) {
    return (
        <h1>
            {title} ({openIssues} open)
        </h1>
    );
}
