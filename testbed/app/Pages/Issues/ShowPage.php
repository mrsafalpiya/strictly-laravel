<?php

namespace App\Pages\Issues;

use App\Data\Activity\ActivityData;
use App\Data\Attachments\AttachmentData;
use App\Data\Comments\CommentData;
use App\Data\Issues\IssueAbilitiesData;
use App\Data\Issues\IssueData;
use App\Data\Issues\IssueFormOptionsData;
use Spatie\LaravelData\Lazy;
use StrictlyLaravel\Inertia\Page;

final class ShowPage extends Page
{
    public function __construct(
        public IssueData $issue,
        /** @var Lazy|array<int, CommentData> Deferred: loaded right after the first paint. Oldest first. */
        public Lazy|array $comments,
        /** @var array<int, AttachmentData> Newest first. */
        public array $attachments,
        /** @var Lazy|array<int, ActivityData> Deferred: loaded right after the first paint. Newest first. */
        public Lazy|array $activity,
        public IssueFormOptionsData $options,
        public IssueAbilitiesData $can,
    ) {}
}
