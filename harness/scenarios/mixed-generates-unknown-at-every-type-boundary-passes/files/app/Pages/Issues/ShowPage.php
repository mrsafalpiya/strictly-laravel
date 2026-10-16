<?php

namespace App\Pages\Issues;

use App\Data\IssueData;
use Inertia\MergeProp;
use Inertia\OnceProp;
use Inertia\ScrollProp;
use StrictlyLaravel\Inertia\Page;

final class ShowPage extends Page
{
    /**
     * @param  array<string, mixed>  $filters  the board's filters to return to
     * @param  OnceProp<array<string, mixed>>  $preferences
     * @param  MergeProp<list<mixed>>  $activity
     * @param  ScrollProp<array<string, mixed>>  $timeline
     */
    public function __construct(
        public IssueData $issue,
        public mixed $context,
        public array $filters,
        public OnceProp $preferences,
        public MergeProp $activity,
        public ScrollProp $timeline,
    ) {}
}
