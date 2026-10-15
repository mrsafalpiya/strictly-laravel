<?php

namespace App\Data\Attachments;

use App\Support\Workspaces\CurrentWorkspace;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Gate;
use Spatie\LaravelData\Attributes\Validation\File;
use Spatie\LaravelData\Attributes\Validation\Max;
use StrictlyLaravel\Data\InputData;

/** POST /w/{workspace}/projects/{project}/issues/{issue}/attachments: a multipart upload, `file: File` in TypeScript. */
final class StoreAttachmentData extends InputData
{
    public function __construct(
        /** `max` is in kilobytes for files: 10 MB. */
        #[File, Max(10 * 1024)]
        public UploadedFile $file,
    ) {}

    /** Runs before validation, so a guest gets a 403, not the fields' errors. */
    public static function authorize(CurrentWorkspace $current): bool
    {
        return Gate::allows('contribute', $current->workspace());
    }
}
