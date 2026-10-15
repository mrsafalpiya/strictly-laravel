<?php

namespace App\Data\Attachments;

use App\Data\Users\UserSummaryData;
use App\Models\Attachment;
use Carbon\CarbonInterface;
use Spatie\LaravelData\Data;

final class AttachmentData extends Data
{
    public function __construct(
        public int $id,
        public string $name,
        public string $mimeType,
        /** Bytes. */
        public int $size,
        public UserSummaryData $uploadedBy,
        public CarbonInterface $createdAt,
    ) {}

    /** Requires user. */
    public static function fromModel(Attachment $attachment): self
    {
        return new self(
            id: $attachment->id,
            name: $attachment->original_name,
            mimeType: $attachment->mime_type,
            size: $attachment->size,
            uploadedBy: UserSummaryData::fromModel($attachment->user),
            createdAt: $attachment->created_at ?? now(),
        );
    }
}
