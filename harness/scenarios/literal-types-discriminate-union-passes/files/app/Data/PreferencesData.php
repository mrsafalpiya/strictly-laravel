<?php

namespace App\Data;

use Spatie\LaravelData\Data;

final class PreferencesData extends Data
{
    /**
     * @param  'monday'|'sunday'  $weekStartsOn
     * @param  10|25|50  $pageSize
     * @param  true  $notificationsAcknowledged
     */
    public function __construct(
        public string $weekStartsOn,
        public int $pageSize,
        public bool $notificationsAcknowledged,
    ) {}
}
