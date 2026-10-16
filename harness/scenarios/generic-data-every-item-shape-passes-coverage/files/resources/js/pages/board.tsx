import { Head } from '@inertiajs/react';
import type { PageProps } from '@/generated';

export default function Board({ board }: PageProps<'board'>) {
    return (
        <>
            <Head title={board.name} />
            {board.columns.map((column) => (
                <section key={column.column}>
                    <h2>{column.column}</h2>
                    <ul>
                        {column.items.map((issue) => (
                            <li key={issue.number}>
                                {issue.title}
                                {issue.assignee !== null && (
                                    <p>{issue.assignee.trim()}</p>
                                )}
                            </li>
                        ))}
                    </ul>
                </section>
            ))}
        </>
    );
}
