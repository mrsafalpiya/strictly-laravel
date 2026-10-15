import { Head } from '@inertiajs/react';
import type { PageProps } from '@/generated';

export default function IssueShow({ issue }: PageProps<'issues/show'>) {
    return <Head title={issue.title} />;
}
