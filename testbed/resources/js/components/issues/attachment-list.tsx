import { Download, Paperclip, Trash2 } from 'lucide-react';
import { useRef } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { useUser } from '@/hooks/use-user';
import { useWorkspace } from '@/hooks/use-workspace';
import { destroy, show, store } from '@/routes/attachments';
import type { AttachmentData, IssueData } from '@/generated';
import {
    forPage,
    useRouteForm,
    visit,
} from '@mrsafalpiya/strictly-laravel/react';

const page = forPage<'issues/show'>();

const reloadAttachments = {
    preserveScroll: true,
    only: page.only('attachments'),
};

function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;

    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function AttachmentList({
    issue,
    attachments,
    canUpload,
}: {
    issue: IssueData;
    attachments: AttachmentData[];
    canUpload: boolean;
}) {
    const workspace = useWorkspace();
    const user = useUser();
    const input = useRef<HTMLInputElement>(null);
    const route = { workspace, project: issue.project, issue };

    // The upload's input class has `file: File`: the field is `null` until one is picked, and its errors are keyed by `file`.
    const form = useRouteForm(store(route), { file: null });

    const upload = (file: File | undefined) => {
        if (file === undefined) return;

        form.setData('file', file);
        form.submit({
            ...reloadAttachments,
            onFinish: () => {
                form.reset();
                if (input.current) input.current.value = '';
            },
        });
    };

    // AttachmentData carries no abilities (its fromModel() has no viewer), so this mirrors
    // AttachmentController::destroy: the uploader or a workspace manager.
    const canDelete = (attachment: AttachmentData) =>
        attachment.uploadedBy.id === user.id || workspace.can.manage;

    return (
        <div className="flex flex-col gap-2">
            {attachments.length > 0 && (
                <ul className="divide-y rounded-lg border text-sm">
                    {attachments.map((attachment) => (
                        <li
                            key={attachment.id}
                            className="flex items-center gap-3 px-3 py-2"
                        >
                            <Paperclip className="size-4 shrink-0 text-muted-foreground" />
                            {/* A plain link: downloads are not Inertia visits. */}
                            <a
                                href={show({ ...route, attachment }).url}
                                className="min-w-0 flex-1 truncate hover:underline"
                                download={attachment.name}
                            >
                                {attachment.name}
                            </a>
                            <span className="text-xs text-muted-foreground tabular-nums">
                                {formatSize(attachment.size)} ·{' '}
                                {attachment.uploadedBy.name}
                            </span>
                            <Button
                                asChild
                                variant="ghost"
                                size="icon"
                                className="size-6"
                            >
                                <a
                                    href={show({ ...route, attachment }).url}
                                    aria-label={`Download ${attachment.name}`}
                                >
                                    <Download className="size-3.5" />
                                </a>
                            </Button>
                            {canDelete(attachment) && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-6"
                                    aria-label={`Delete ${attachment.name}`}
                                    onClick={() =>
                                        confirm(`Delete ${attachment.name}?`) &&
                                        visit(
                                            destroy({ ...route, attachment }),
                                            reloadAttachments,
                                        )
                                    }
                                >
                                    <Trash2 className="size-3.5" />
                                </Button>
                            )}
                        </li>
                    ))}
                </ul>
            )}

            {attachments.length === 0 && !canUpload && (
                <p className="text-sm text-muted-foreground">No attachments.</p>
            )}

            {canUpload && (
                <div className="flex flex-col gap-1.5">
                    <input
                        ref={input}
                        type="file"
                        className="sr-only"
                        aria-label="Attach a file"
                        onChange={(event) => upload(event.target.files?.[0])}
                        disabled={form.processing}
                    />
                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={form.processing}
                            onClick={() => input.current?.click()}
                        >
                            <Paperclip className="size-4" /> Attach a file
                        </Button>
                        <span className="text-xs text-muted-foreground">
                            Up to 10 MB
                        </span>
                    </div>
                    {form.progress !== null && (
                        <progress
                            className="h-1.5 w-full"
                            value={form.progress.percentage ?? 0}
                            max={100}
                            aria-label="Upload progress"
                        />
                    )}
                    <InputError message={form.errors.file} />
                </div>
            )}
        </div>
    );
}
