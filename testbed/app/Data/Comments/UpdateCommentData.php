<?php

namespace App\Data\Comments;

use App\Models\Comment;
use Illuminate\Http\Request;
use Spatie\LaravelData\Attributes\Validation\Max;
use Spatie\LaravelData\Attributes\Validation\Min;
use StrictlyLaravel\Data\InputData;

/** PATCH /w/{workspace}/projects/{project}/issues/{issue}/comments/{comment} */
final class UpdateCommentData extends InputData
{
    public function __construct(
        #[Min(1), Max(10_000)]
        public string $body,
    ) {}

    /** Runs before validation: only the author edits a comment (CommentPolicy::update). */
    public static function authorize(Request $request): bool
    {
        // authorize() can't take the route's bound models (P-126): read the comment from the current route.
        $comment = $request->route('comment');

        return $comment instanceof Comment && $request->user()?->can('update', $comment) === true;
    }
}
