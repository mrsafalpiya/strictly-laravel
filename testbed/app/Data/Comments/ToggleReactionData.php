<?php

namespace App\Data\Comments;

use App\Enums\Reaction;
use App\Support\Workspaces\CurrentWorkspace;
use StrictlyLaravel\Data\InputData;

/** POST /w/{workspace}/projects/{project}/issues/{issue}/comments/{comment}/reactions: adds or removes one. */
final class ToggleReactionData extends InputData
{
    public function __construct(
        public Reaction $emoji,
    ) {}

    /** Runs before validation, so a guest gets a 403 rather than the emoji's errors. */
    public static function authorize(CurrentWorkspace $current): bool
    {
        return $current->role()->canContribute();
    }
}
