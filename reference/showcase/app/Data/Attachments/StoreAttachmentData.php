<?php

namespace App\Data\Attachments;

use App\Support\Data\InputData;
use Illuminate\Http\UploadedFile;
use Spatie\LaravelData\Attributes\Validation\File;
use Spatie\LaravelData\Attributes\Validation\Max;

/**
 * Multipart upload. typescript-transformer has no mapping for UploadedFile and emits `file: undefined`,
 * so the TypeScript type is spelled out: the browser sends a `File` (Inertia switches to FormData).
 */
final class StoreAttachmentData extends InputData
{
    public function __construct(
        /** `max` is in kilobytes for files: 10 MB. */
        #[File, Max(10 * 1024)]
        public UploadedFile $file,
    ) {}
}
