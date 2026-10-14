<?php

namespace App\Pages\Issues;

use App\Data\Activity\ActivityData;
use App\Data\Attachments\AttachmentData;
use App\Data\Comments\CommentData;
use App\Data\Issues\IssueAbilitiesData;
use App\Data\Issues\IssueData;
use App\Data\Issues\IssueFormOptionsData;
use App\Support\Inertia\Page;
use Spatie\LaravelData\Lazy;

final class ShowPage extends Page
{
    public function __construct(
        public IssueData $issue,
        /** @var Lazy|array<int, CommentData> Deferred: loaded right after the first paint. */
        public Lazy|array $comments,
        /** @var array<int, AttachmentData> */
        public array $attachments,
        /** @var Lazy|array<int, ActivityData> Deferred. */
        public Lazy|array $activity,
        public IssueFormOptionsData $options,
        public IssueAbilitiesData $can,
    ) {}
}
