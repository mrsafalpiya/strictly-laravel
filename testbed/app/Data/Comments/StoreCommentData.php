<?php

namespace App\Data\Comments;

use App\Support\Workspaces\CurrentWorkspace;
use Spatie\LaravelData\Attributes\Validation\Max;
use Spatie\LaravelData\Attributes\Validation\Min;
use StrictlyLaravel\Data\InputData;

/** POST /w/{workspace}/projects/{project}/issues/{issue}/comments */
final class StoreCommentData extends InputData
{
    public function __construct(
        #[Min(1), Max(10_000)]
        public string $body,
    ) {}

    /** Runs before validation, so a guest gets a 403 rather than the body's errors. */
    public static function authorize(CurrentWorkspace $current): bool
    {
        return $current->role()->canContribute();
    }
}
