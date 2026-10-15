<?php

namespace App\Http\Controllers;

use App\Data\Attachments\StoreAttachmentData;
use App\Data\FlashData;
use App\Models\Attachment;
use App\Models\Issue;
use App\Models\Project;
use App\Models\User;
use App\Models\Workspace;
use App\Support\Workspaces\CurrentWorkspace;
use Illuminate\Container\Attributes\CurrentUser;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use RuntimeException;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Files live on the private `local` disk. Routes are nested under the issue, so scoped bindings
 * prove the attachment belongs to this workspace: membership is enough to download.
 */
final class AttachmentController extends Controller
{
    private const string DISK = 'local';

    public function store(StoreAttachmentData $data, Workspace $workspace, Project $project, Issue $issue, #[CurrentUser] User $user): RedirectResponse
    {
        $file = $data->file;
        $path = $file->store("attachments/{$workspace->id}/{$issue->id}", self::DISK);

        if ($path === false) {
            throw new RuntimeException('Could not store the uploaded file.');
        }

        $issue->attachments()->create([
            'user_id' => $user->id,
            'disk' => self::DISK,
            'path' => $path,
            'original_name' => $file->getClientOriginalName(),
            'mime_type' => $file->getClientMimeType(),
            'size' => $file->getSize(),
        ]);

        FlashData::success("Uploaded {$file->getClientOriginalName()}.");

        return back();
    }

    public function show(Workspace $workspace, Project $project, Issue $issue, Attachment $attachment): StreamedResponse
    {
        return Storage::disk($attachment->disk)->download($attachment->path, $attachment->original_name);
    }

    public function destroy(Workspace $workspace, Project $project, Issue $issue, Attachment $attachment, #[CurrentUser] User $user, CurrentWorkspace $current): RedirectResponse
    {
        // The uploader or a manager. AttachmentData carries no abilities, so the page mirrors this check.
        abort_unless($attachment->user_id === $user->id || $current->role()->canManage(), 403);

        Storage::disk($attachment->disk)->delete($attachment->path);
        $attachment->delete();

        FlashData::success("Deleted {$attachment->original_name}.");

        return back();
    }
}
