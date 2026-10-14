<?php

namespace App\Pages\Notifications;

use App\Data\Notifications\NotificationData;
use App\Support\Inertia\Page;
use Spatie\LaravelData\PaginatedDataCollection;

final class IndexPage extends Page
{
    public function __construct(
        /** @var PaginatedDataCollection<int, NotificationData> Unread first, then newest first. */
        public PaginatedDataCollection $notifications,
    ) {}
}
