<?php

namespace App\Data\Comments;

use App\Support\Data\InputData;
use Spatie\LaravelData\Attributes\Validation\Max;
use Spatie\LaravelData\Attributes\Validation\Min;

final class StoreCommentData extends InputData
{
    public function __construct(
        #[Min(1), Max(10_000)]
        public string $body,
    ) {}
}
