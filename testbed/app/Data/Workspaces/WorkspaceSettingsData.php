<?php

namespace App\Data\Workspaces;

use App\Enums\IssueView;
use Spatie\LaravelData\Attributes\Validation\In;
use Spatie\LaravelData\Data;

/**
 * Stored as JSON in workspaces.settings (Eloquent cast) and edited as a nested form.
 */
final class WorkspaceSettingsData extends Data
{
    public function __construct(
        public IssueView $defaultView = IssueView::List,
        /** @var 'monday'|'sunday' The PHPDoc only types TS/PHPStan; #[In] is what the server validates. */
        #[In(['monday', 'sunday'])]
        public string $weekStartsOn = 'monday',
        public bool $allowGuests = false,
        public WorkspaceNotificationSettingsData $notifications = new WorkspaceNotificationSettingsData,
    ) {}
}
