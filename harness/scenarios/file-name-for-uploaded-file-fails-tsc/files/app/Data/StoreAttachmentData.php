<?php

namespace App\Data;

use Illuminate\Http\UploadedFile;
use Spatie\LaravelData\Data;

final class StoreAttachmentData extends Data
{
    public function __construct(
        public UploadedFile $file,
    ) {}
}
